// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sanity/loaders", () => ({
  getNotes: vi.fn(),
  getBlogPosts: vi.fn()
}));

import { getBlogPosts, getNotes } from "@/lib/sanity/loaders";
import * as mcp from "@/app/api/mcp/route";
import * as experience from "@/app/api/me/experience/route";
import * as recent from "@/app/api/me/recent/route";
import * as search from "@/app/api/me/search/route";
import * as work from "@/app/api/me/work/[slug]/route";
import * as profile from "@/app/api/me/profile/route";
import * as projects from "@/app/api/me/projects/route";
import * as contact from "@/app/api/me/contact/route";
import { workItems } from "@/content/work";
import { makeNote, makePost } from "./profile-fixtures";

const URL_ = "http://localhost/api/mcp";
let nextId = 1;

function rpc(method: string, params?: unknown): Request {
  return new Request(URL_, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params })
  });
}

async function call(method: string, params?: unknown) {
  const response = await mcp.POST(rpc(method, params));
  return { response, body: await response.json() };
}

async function callTool(name: string, args: Record<string, unknown> = {}) {
  const { body } = await call("tools/call", { name, arguments: args });
  return body;
}

async function apiData(response: Response) {
  return (await response.json()).data;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(getNotes).mockResolvedValue([
    makeNote({ slug: "older-note", title: "Older note", publishedAt: "2026-01-01T00:00:00Z" }),
    makeNote({ slug: "newer-note", title: "Newer note", publishedAt: "2026-04-01T00:00:00Z" })
  ]);
  vi.mocked(getBlogPosts).mockResolvedValue([
    makePost({ slug: "a-post", title: "A post", publishedAt: "2026-02-01T00:00:00Z" })
  ]);
});

describe("transport", () => {
  it("initialize returns server info and the tools capability", async () => {
    const { response, body } = await call("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test", version: "0" }
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(body.result.serverInfo.name).toBe("rishi");
    expect(body.result.serverInfo.version).toBeTruthy();
    expect(body.result.capabilities.tools).toBeDefined();
  });

  it("GET and DELETE return 405 with Allow", async () => {
    for (const handler of [mcp.GET, mcp.DELETE]) {
      const response = handler();
      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toBe("POST, OPTIONS");
    }
  });

  it("OPTIONS returns CORS preflight headers", () => {
    const response = mcp.OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("access-control-allow-methods")).toBe("POST, OPTIONS");
    expect(response.headers.get("access-control-allow-headers")).toBe(
      "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version"
    );
  });

  it("returns a generic JSON-RPC error for malformed JSON", async () => {
    const response = await mcp.POST(
      new Request(URL_, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
        body: "{not json"
      })
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect((await response.json()).error.code).toBe(-32700);
  });
});

describe("tools/list", () => {
  it("lists exactly the seven read-only tools", async () => {
    const { body } = await call("tools/list");
    const tools = body.result.tools as Array<{ name: string; title: string; description: string; annotations: object }>;
    expect(tools.map((tool) => tool.name).sort()).toEqual(
      [
        "get_contact",
        "get_experience",
        "get_profile",
        "get_projects",
        "get_recent",
        "get_work_item",
        "search_content"
      ].sort()
    );
    for (const tool of tools) {
      expect(tool.title).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.annotations).toEqual({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      });
    }
  });
});

describe("tools/call", () => {
  it("get_profile matches the JSON API", async () => {
    const { result } = await callTool("get_profile");
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual(await apiData(await profile.GET()));
    expect(JSON.parse(result.content[0].text)).toEqual(result.structuredContent);
  });

  it("get_experience matches the JSON API", async () => {
    const { result } = await callTool("get_experience");
    const data = await apiData(await experience.GET());
    expect(data.length).toBeGreaterThan(0);
    expect(result.structuredContent).toEqual({ items: data });
    expect(data[0].url).toMatch(/^\/v2\/notes\//);
  });

  it("get_work_item matches the JSON API", async () => {
    const slug = workItems[0].slug;
    const { result } = await callTool("get_work_item", { slug });
    const response = await work.GET(new Request(`http://localhost/api/me/work/${slug}`), {
      params: Promise.resolve({ slug })
    });
    expect(result.structuredContent).toEqual(await apiData(response));
  });

  it("get_work_item with an unknown slug is a tool error, not a protocol error", async () => {
    const body = await callTool("get_work_item", { slug: "no-such-item" });
    expect(body.error).toBeUndefined();
    expect(body.result.isError).toBe(true);
    expect(body.result.content[0].text).toBe("No work item with that slug.");
  });

  it("get_recent matches the JSON API and respects limit", async () => {
    const { result } = await callTool("get_recent", { limit: 2 });
    const data = await apiData(await recent.GET(new Request("http://localhost/api/me/recent?limit=2")));
    expect(result.structuredContent).toEqual({ items: data });
    expect(data).toHaveLength(2);
    const defaults = await callTool("get_recent");
    const defaultData = await apiData(await recent.GET(new Request("http://localhost/api/me/recent")));
    expect(defaults.result.structuredContent).toEqual({ items: defaultData });
  });

  it("get_projects matches the JSON API", async () => {
    const { result } = await callTool("get_projects");
    expect(result.structuredContent).toEqual({ items: await apiData(await projects.GET()) });
  });

  it("search_content matches the JSON API", async () => {
    const { result } = await callTool("search_content", { query: "note", limit: 5 });
    const data = await apiData(await search.GET(new Request("http://localhost/api/me/search?q=note&limit=5")));
    expect(data.length).toBeGreaterThan(0);
    expect(result.structuredContent).toEqual({ items: data });
  });

  it("get_contact matches the JSON API", async () => {
    const { result } = await callTool("get_contact");
    expect(result.structuredContent).toEqual({ items: await apiData(await contact.GET()) });
  });
});

describe("invalid input", () => {
  it.each([
    ["get_recent", { limit: 0 }],
    ["get_recent", { limit: 26 }],
    ["search_content", { query: "" }],
    ["search_content", { query: "x".repeat(201) }],
    ["search_content", { query: "ok", limit: 0 }],
    ["get_work_item", { slug: "Bad Slug!" }],
    ["get_work_item", { slug: "a".repeat(121) }]
  ])("%s rejects %j", async (name, args) => {
    const body = await callTool(name, args);
    expect(Boolean(body.error) || body.result?.isError === true).toBe(true);
  });

  it("an unknown tool is an error", async () => {
    const body = await callTool("delete_everything");
    expect(Boolean(body.error) || body.result?.isError === true).toBe(true);
  });
});

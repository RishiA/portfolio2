// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sanity/loaders", () => ({
  getNotes: vi.fn(),
  getBlogPosts: vi.fn()
}));

import { getBlogPosts, getNotes } from "@/lib/sanity/loaders";
import * as index from "@/app/api/me/route";
import * as profile from "@/app/api/me/profile/route";
import * as experience from "@/app/api/me/experience/route";
import * as work from "@/app/api/me/work/[slug]/route";
import * as recent from "@/app/api/me/recent/route";
import * as projects from "@/app/api/me/projects/route";
import * as search from "@/app/api/me/search/route";
import * as contact from "@/app/api/me/contact/route";
import { makeNote, makePost } from "./profile-fixtures";

const BASE = "http://localhost/api/me";
const SUCCESS_CACHE = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";
const get = (path: string) => new Request(`${BASE}${path}`);
const slugParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

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

async function expectSuccess(response: Response) {
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("application/json");
  expect(response.headers.get("access-control-allow-origin")).toBe("*");
  expect(response.headers.get("cache-control")).toBe(SUCCESS_CACHE);
  const body = await response.json();
  expect(body.version).toBe(1);
  expect(body).toHaveProperty("data");
  return body.data;
}

async function expectError(response: Response, status: number, code: string) {
  expect(response.status).toBe(status);
  expect(response.headers.get("access-control-allow-origin")).toBe("*");
  expect(response.headers.get("cache-control")).toBe("no-store");
  const body = await response.json();
  expect(body.version).toBe(1);
  expect(body.error.code).toBe(code);
  expect(typeof body.error.message).toBe("string");
  expect(body.error.message.length).toBeLessThan(120);
  return body;
}

describe("static routes", () => {
  it("index lists endpoints and the mcp path", async () => {
    const data = await expectSuccess(await index.GET());
    expect(data.mcp).toBe("/api/mcp");
    const paths = data.endpoints.map((e: { path: string }) => e.path);
    expect(paths).toEqual([
      "/api/me",
      "/api/me/profile",
      "/api/me/experience",
      "/api/me/work/{slug}",
      "/api/me/recent",
      "/api/me/projects",
      "/api/me/search",
      "/api/me/contact"
    ]);
    expect(data.endpoints.every((e: { method: string }) => e.method === "GET")).toBe(true);
  });

  it("profile", async () => {
    const data = await expectSuccess(await profile.GET());
    expect(data.name).toBeTruthy();
    expect(Array.isArray(data.bio)).toBe(true);
  });

  it("experience items carry a note url", async () => {
    const data = await expectSuccess(await experience.GET());
    expect(data.length).toBeGreaterThan(0);
    for (const entry of data) expect(entry.url).toBe(`/v2/notes/${entry.workSlug}`);
  });

  it("projects carry a note url", async () => {
    const data = await expectSuccess(await projects.GET());
    expect(data.length).toBeGreaterThan(0);
    for (const project of data) expect(project.url).toBe(`/v2/notes/${project.slug}`);
  });

  it("contact returns links only, without email", async () => {
    const data = await expectSuccess(await contact.GET());
    expect(data.length).toBeGreaterThan(0);
    for (const link of data) expect(link.href).not.toMatch(/^mailto:/);
  });

  it("declare a 60 second revalidate", () => {
    for (const mod of [index, profile, experience, projects, contact, work]) {
      expect(mod.revalidate).toBe(60);
    }
  });
});

describe("/work/[slug]", () => {
  it("returns the item with url", async () => {
    const data = await expectSuccess(await work.GET(get("/work/rho"), slugParams("rho")));
    expect(data.slug).toBe("rho");
    expect(data.url).toBe("/v2/notes/rho");
  });
  it("400 on a malformed slug", async () => {
    await expectError(await work.GET(get("/work/Bad_Slug"), slugParams("Bad_Slug")), 400, "invalid_request");
    await expectError(await work.GET(get("/work/x"), slugParams("a".repeat(121))), 400, "invalid_request");
  });
  it("404 on an unknown slug", async () => {
    await expectError(await work.GET(get("/work/nope"), slugParams("nope")), 404, "not_found");
  });
});

describe("/recent", () => {
  it("defaults to newest first", async () => {
    const data = await expectSuccess(await recent.GET(get("/recent")));
    const slugs = data.map((item: { slug: string }) => item.slug);
    const mocked = slugs.filter((slug: string) => ["newer-note", "a-post", "older-note"].includes(slug));
    expect(mocked).toEqual(["newer-note", "a-post", "older-note"]);
  });
  it("honours limit", async () => {
    const data = await expectSuccess(await recent.GET(get("/recent?limit=2")));
    expect(data).toHaveLength(2);
  });
  it.each(["0", "26", "abc", "2.5", ""])("400 on limit=%j", async (limit) => {
    await expectError(await recent.GET(get(`/recent?limit=${limit}`)), 400, "invalid_request");
  });
});

describe("/search", () => {
  it("returns hits with url", async () => {
    const data = await expectSuccess(await search.GET(get("/search?q=newer")));
    expect(data[0]).toMatchObject({ slug: "newer-note", url: "/v2/notes/newer-note" });
  });
  it("honours limit", async () => {
    const data = await expectSuccess(await search.GET(get("/search?q=note&limit=1")));
    expect(data).toHaveLength(1);
  });
  it("400 when q is missing, empty, blank or too long", async () => {
    await expectError(await search.GET(get("/search")), 400, "invalid_request");
    await expectError(await search.GET(get("/search?q=")), 400, "invalid_request");
    await expectError(await search.GET(get("/search?q=%20%20")), 400, "invalid_request");
    await expectError(await search.GET(get(`/search?q=${"a".repeat(201)}`)), 400, "invalid_request");
  });
  it.each(["0", "26", "abc", "2.5"])("400 on limit=%s", async (limit) => {
    await expectError(await search.GET(get(`/search?q=note&limit=${limit}`)), 400, "invalid_request");
  });
});

describe("OPTIONS", () => {
  it.each([
    ["index", index],
    ["profile", profile],
    ["experience", experience],
    ["work", work],
    ["recent", recent],
    ["projects", projects],
    ["search", search],
    ["contact", contact]
  ])("%s returns 204 with CORS headers", async (_name, mod) => {
    const response = mod.OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("access-control-allow-methods")).toBe("GET, HEAD, OPTIONS");
    expect(response.headers.get("access-control-allow-headers")).toBe("Content-Type");
    expect(response.headers.get("access-control-max-age")).toBe("86400");
    expect(await response.text()).toBe("");
  });
});

describe("failures", () => {
  it("a throwing loader becomes a generic 500", async () => {
    vi.mocked(getNotes).mockRejectedValue(new Error("secret db password in stack"));
    for (const response of [await recent.GET(get("/recent")), await search.GET(get("/search?q=a"))]) {
      const body = await expectError(response, 500, "internal_error");
      expect(JSON.stringify(body)).not.toMatch(/secret|stack|Error/);
    }
  });
});

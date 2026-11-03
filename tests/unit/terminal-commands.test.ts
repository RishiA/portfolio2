import { describe, expect, it } from "vitest";
import { buildRequest, COMMANDS, findCommand, localOutput } from "@/lib/terminal/commands";
import * as limits from "@/lib/terminal/limits";
import * as validation from "@/lib/profile/validation";

describe("limits mirror the API", () => {
  it("has the same constants as validation.ts", () => {
    expect(limits.LIMIT_MIN).toBe(validation.LIMIT_MIN);
    expect(limits.LIMIT_MAX).toBe(validation.LIMIT_MAX);
    expect(limits.QUERY_MIN).toBe(validation.QUERY_MIN);
    expect(limits.QUERY_MAX).toBe(validation.QUERY_MAX);
    expect(limits.SLUG_MAX).toBe(validation.SLUG_MAX);
    for (const slug of ["a", "a-b", "A", "a--b", "-a", "a_b"]) {
      expect(limits.SLUG_PATTERN.test(slug)).toBe(validation.parseSlug(slug).ok);
    }
  });
});

describe("registry", () => {
  it("lists the documented commands with usage and description", () => {
    expect(COMMANDS.map((command) => command.name)).toEqual([
      "help", "profile", "experience", "work", "recent", "projects", "search", "contact", "resume", "api", "mcp", "clear"
    ]);
    for (const command of COMMANDS) {
      expect(command.usage.startsWith(`/${command.name}`)).toBe(true);
      expect(command.description.length).toBeGreaterThan(0);
    }
    expect(COMMANDS.filter((command) => command.api).map((command) => command.name)).toHaveLength(7);
    expect(findCommand("nope")).toBeUndefined();
  });
});

describe("buildRequest", () => {
  it("maps simple commands to routes", () => {
    expect(buildRequest("experience", [])).toEqual({ ok: true, path: "/api/me/experience" });
    expect(buildRequest("profile", [])).toEqual({ ok: true, path: "/api/me/profile" });
  });

  it("validates work slugs", () => {
    expect(buildRequest("work", ["rho-fintech"])).toEqual({ ok: true, path: "/api/me/work/rho-fintech" });
    expect(buildRequest("work", [])).toMatchObject({ ok: false });
    expect(buildRequest("work", ["Bad Slug"])).toMatchObject({ ok: false });
    expect(buildRequest("work", ["../etc"])).toMatchObject({ ok: false });
    expect(buildRequest("work", ["a".repeat(121)])).toMatchObject({ ok: false });
    expect(buildRequest("work", ["a", "b"])).toMatchObject({ ok: false });
  });

  it("validates the recent limit", () => {
    expect(buildRequest("recent", [])).toEqual({ ok: true, path: "/api/me/recent" });
    expect(buildRequest("recent", ["5"])).toEqual({ ok: true, path: "/api/me/recent?limit=5" });
    expect(buildRequest("recent", ["25"])).toMatchObject({ ok: true });
    for (const bad of ["0", "26", "-1", "abc", "1.5", ""]) {
      expect(buildRequest("recent", [bad])).toMatchObject({ ok: false });
    }
  });

  it("validates and encodes the search query", () => {
    expect(buildRequest("search", ["design", "systems"])).toEqual({ ok: true, path: "/api/me/search?q=design%20systems" });
    expect(buildRequest("search", ["a&b=c"])).toEqual({ ok: true, path: "/api/me/search?q=a%26b%3Dc" });
    expect(buildRequest("search", [])).toMatchObject({ ok: false });
    expect(buildRequest("search", ["   "])).toMatchObject({ ok: false });
    expect(buildRequest("search", ["x".repeat(201)])).toMatchObject({ ok: false });
    expect(buildRequest("search", ["x".repeat(200)])).toMatchObject({ ok: true });
  });
});

describe("localOutput", () => {
  it("help lists every command", () => {
    const [, list] = localOutput("help", "https://x.test") ?? [];
    expect(list).toMatchObject({ type: "list" });
    expect(list.type === "list" && list.items).toHaveLength(COMMANDS.length);
  });

  it("api prints a curl example and the endpoints using the origin", () => {
    const blocks = localOutput("api", "https://rishiathanikar.com") ?? [];
    expect(blocks).toContainEqual({ type: "code", text: "curl https://rishiathanikar.com/api/me/experience" });
    expect(blocks.some((block) => block.type === "rows")).toBe(true);
  });

  it("mcp prints the add command, copyable", () => {
    expect(localOutput("mcp", "https://rishiathanikar.com")).toContainEqual({
      type: "code",
      text: "claude mcp add --transport http rishi https://rishiathanikar.com/api/mcp",
      copyable: true
    });
  });

  it("resume links to /Resume and unknown names return null", () => {
    expect(JSON.stringify(localOutput("resume", ""))).toContain('"href":"/Resume"');
    expect(localOutput("experience", "")).toBeNull();
  });
});

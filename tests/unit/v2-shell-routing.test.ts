import { describe, expect, it } from "vitest";
import {
  getNoteSlugFromShellPathname,
  getShellAppIdFromPathname,
  getShellUrlForApp,
  normalizeShellPathname,
  parseShellLocation
} from "@/lib/v2/shell-routing";

describe("v2 shell routing", () => {
  it("maps /v2 paths to app ids", () => {
    expect(getShellAppIdFromPathname("/v2/notes")).toBe("notes");
    expect(getShellAppIdFromPathname("/v2/terminal")).toBe("terminal");
    expect(getShellAppIdFromPathname("/v2/photos")).toBe("photos");
    expect(getShellAppIdFromPathname("/v2/music")).toBe("music");
    expect(getShellAppIdFromPathname("/v2/settings")).toBe("settings");
  });

  it("treats /v2 as Notes and falls back for unknown paths", () => {
    expect(normalizeShellPathname("/v2")).toBe("/v2/notes");
    expect(getShellAppIdFromPathname("/v2")).toBe("notes");
    expect(getShellAppIdFromPathname("/v2/unknown")).toBe("notes");
    expect(getShellAppIdFromPathname("/music")).toBe("notes");
  });

  it("maps app ids to /v2 urls", () => {
    expect(getShellUrlForApp("notes")).toBe("/v2/notes");
    expect(getShellUrlForApp("music")).toBe("/v2/music");
    expect(getShellUrlForApp("settings")).toBe("/v2/settings");
  });

  it("has no url for Trash", () => {
    expect(getShellUrlForApp("trash")).toBeNull();
  });

  it("keeps the note slug in the url", () => {
    expect(getShellUrlForApp("notes", { noteSlug: "hello world" })).toBe("/v2/notes/hello%20world");
    expect(getShellUrlForApp("notes", { currentPathname: "/v2/notes/abc" })).toBe("/v2/notes/abc");
    expect(getNoteSlugFromShellPathname("/v2/notes/hello%20world")).toBe("hello world");
    expect(getNoteSlugFromShellPathname("/v2/notes")).toBeUndefined();
  });

  it("round-trips every app", () => {
    for (const appId of ["notes", "terminal", "photos", "music", "settings"]) {
      const url = getShellUrlForApp(appId);
      expect(url).not.toBeNull();
      expect(getShellAppIdFromPathname(url as string)).toBe(appId);
    }
  });

  it("sends terminal and settings to Notes on phones", () => {
    expect(getShellUrlForApp("terminal", { context: "mobile" })).toBe("/v2/notes");
    expect(parseShellLocation("/v2/settings", { context: "mobile" })).toEqual({
      normalizedPathname: "/v2/notes",
      appId: "notes",
      noteSlug: undefined
    });
    expect(parseShellLocation("/v2/music", { context: "mobile" }).appId).toBe("music");
  });

  it("parses a note detail path", () => {
    expect(parseShellLocation("/v2/notes/my-note")).toEqual({
      normalizedPathname: "/v2/notes/my-note",
      appId: "notes",
      noteSlug: "my-note"
    });
  });
});

import { describe, expect, it } from "vitest";
import { canonicalPathFor } from "@/lib/v2/notes/canonical";
import { noteDateLine } from "@/lib/v2/notes/date-line";
import { noteSlugFromHref } from "@/lib/v2/notes/note-href";
import { aboutDetail, item, noteDetail, postDetail, workDetail } from "./v2-notes-fixtures";

describe("canonicalPathFor", () => {
  it("points mirrored notes at their v1 page", () => {
    expect(canonicalPathFor(item({ slug: "rho", kind: "work" }))).toBe("/work/rho");
    expect(canonicalPathFor(item({ slug: "on-money", kind: "post" }))).toBe("/blog/on-money");
    expect(canonicalPathFor(item({ slug: "a-link", kind: "note" }))).toBe("/notes/a-link");
    expect(canonicalPathFor(item({ slug: "about-me", kind: "about" }))).toBe("/about");
  });

  it("keeps v2-only notes pointing at themselves", () => {
    expect(canonicalPathFor(item({ slug: "playground", kind: "landing" }))).toBe("/v2/notes/playground");
    expect(canonicalPathFor(item({ slug: "agent-demo", kind: "project" }))).toBe("/v2/notes/agent-demo");
  });
});

describe("noteDateLine", () => {
  it("shows the full date for notes", () => {
    expect(noteDateLine(noteDetail)).toBe("May 14, 2026 at 5:33 PM");
  });

  it("adds reading time for posts", () => {
    expect(noteDateLine(postDetail)).toBe("October 1, 2026 at 11:00 AM · 4 min read");
  });

  it("shows the period for work items and nothing for undated notes", () => {
    expect(noteDateLine(workDetail)).toBe("2023 - Present");
    expect(noteDateLine(aboutDetail)).toBeNull();
  });
});

describe("noteSlugFromHref", () => {
  it("reads the slug of a v2 note link", () => {
    expect(noteSlugFromHref("/v2/notes/rho")).toBe("rho");
    expect(noteSlugFromHref("/v2/notes/rho?x=1#top")).toBe("rho");
    expect(noteSlugFromHref("/v2/notes/a%20b")).toBe("a b");
  });

  it("ignores every other link", () => {
    expect(noteSlugFromHref("/v2/notes")).toBeNull();
    expect(noteSlugFromHref("/v2/notes/")).toBeNull();
    expect(noteSlugFromHref("/notes/rho")).toBeNull();
    expect(noteSlugFromHref("https://example.com/v2/notes/rho")).toBeNull();
  });
});

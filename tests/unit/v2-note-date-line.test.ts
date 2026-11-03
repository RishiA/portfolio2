import { describe, expect, it } from "vitest";
import { noteDateLine } from "@/components/v2/notes/note-view";
import type { NoteDetail } from "@/lib/profile/types";
import type { BlogPost, Note, PlaygroundItem } from "@/types/content";
import { item } from "./v2-fixtures";

const PUBLISHED = "2026-10-01T15:00:00.000Z";

const note = (): Extract<NoteDetail, { kind: "note" }> => ({
  kind: "note",
  item: item({ slug: "n", kind: "note", date: PUBLISHED }),
  source: { slug: "n", publishedAt: PUBLISHED } as Note
});

const post = (updatedAt?: string): Extract<NoteDetail, { kind: "post" }> => ({
  kind: "post",
  item: item({ slug: "p", kind: "post", date: PUBLISHED }),
  source: { slug: "p", publishedAt: PUBLISHED, updatedAt, readingTimeMinutes: 3 } as BlogPost
});

const project = (): Extract<NoteDetail, { kind: "project" }> => ({
  kind: "project",
  item: item({ slug: "x", kind: "project", date: "2026-10-30T15:00:00.000Z" }),
  source: { slug: "x", name: "X", oneLiner: "", status: "live", stack: [] } as PlaygroundItem
});

describe("noteDateLine", () => {
  it("labels notes as published", () => {
    expect(noteDateLine(note())).toBe("Published Oct 1, 2026");
  });

  it("labels projects as updated", () => {
    expect(noteDateLine(project())).toBe("Updated Oct 30, 2026");
  });

  it("labels posts as published when there is no separate update", () => {
    expect(noteDateLine(post())).toBe("Published Oct 1, 2026");
  });

  it("shows the update date for posts updated on a different day", () => {
    expect(noteDateLine(post("2026-10-20T12:00:00.000Z"))).toBe("Published Oct 1, 2026 · Updated Oct 20, 2026");
  });

  it("does not show an update when updatedAt formats to the published day", () => {
    expect(noteDateLine(post("2026-10-01T23:30:00.000Z"))).toBe("Published Oct 1, 2026");
  });

  it("returns null when there is no date", () => {
    const undated = { ...note(), item: item({ slug: "n", kind: "note" }) };
    expect(noteDateLine(undated)).toBeNull();
  });
});

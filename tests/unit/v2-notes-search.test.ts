import { describe, expect, it } from "vitest";
import { searchNotes, searchPreviewText } from "@/lib/v2/notes/search";
import { fixtureItems, item } from "./v2-notes-fixtures";

describe("searchNotes", () => {
  it("returns everything for an empty query", () => {
    expect(searchNotes(fixtureItems, "  ")).toHaveLength(fixtureItems.length);
  });

  it("matches title and excerpt, title matches first", () => {
    expect(searchNotes(fixtureItems, "rho").map((entry) => entry.slug)).toEqual(["rho", "on-money"]);
  });

  it("is case insensitive and puts an exact title match first", () => {
    const items = [item({ slug: "a", title: "Rho and more" }), item({ slug: "b", title: "RHO" })];
    expect(searchNotes(items, "rho").map((entry) => entry.slug)).toEqual(["b", "a"]);
  });

  it("returns nothing when no title or excerpt matches", () => {
    expect(searchNotes(fixtureItems, "zzzz")).toEqual([]);
  });
});

describe("searchPreviewText", () => {
  it("returns the excerpt when the query is empty or absent", () => {
    expect(searchPreviewText("An excerpt.", "")).toBe("An excerpt.");
    expect(searchPreviewText("An excerpt.", "zzz")).toBe("An excerpt.");
  });

  it("trims the text around a late match and adds ellipses", () => {
    const excerpt = `${"a".repeat(60)} needle ${"b".repeat(120)}`;
    const preview = searchPreviewText(excerpt, "needle");
    expect(preview.startsWith("…")).toBe(true);
    expect(preview.endsWith("…")).toBe(true);
    expect(preview).toContain("needle");
  });
});

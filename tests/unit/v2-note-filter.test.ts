import { describe, expect, it } from "vitest";
import { filterByCollection, isCollectionId, searchNotes } from "@/lib/v2/note-filter";
import { fixtureItems, item } from "./v2-fixtures";

describe("filterByCollection", () => {
  it("shows everything under All, including landing notes", () => {
    expect(filterByCollection(fixtureItems, "all")).toHaveLength(fixtureItems.length);
  });

  it("filters by collection and leaves landing notes out", () => {
    expect(filterByCollection(fixtureItems, "work").map((i) => i.slug)).toEqual(["rho"]);
    expect(filterByCollection(fixtureItems, "writing").map((i) => i.slug)).toEqual(["on-money"]);
    expect(filterByCollection(fixtureItems, "notes").map((i) => i.slug)).toEqual(["a-link"]);
  });

  it("validates stored collection ids", () => {
    expect(isCollectionId("work")).toBe(true);
    expect(isCollectionId("nope")).toBe(false);
    expect(isCollectionId(null)).toBe(false);
  });
});

describe("searchNotes", () => {
  it("returns everything for an empty query", () => {
    expect(searchNotes(fixtureItems, "  ")).toHaveLength(fixtureItems.length);
  });

  it("matches title and excerpt case-insensitively and drops non-matches", () => {
    expect(searchNotes(fixtureItems, "RHO").map((i) => i.slug)).toEqual(["rho", "on-money"]);
    expect(searchNotes(fixtureItems, "zzz")).toEqual([]);
  });

  it("ranks an exact title match before a partial title match before an excerpt match", () => {
    const items = [
      item({ slug: "excerpt", title: "Other", excerpt: "mentions rho here" }),
      item({ slug: "partial", title: "Rho: PM", excerpt: "x" }),
      item({ slug: "exact", title: "Rho", excerpt: "x" })
    ];
    expect(searchNotes(items, "rho").map((i) => i.slug)).toEqual(["exact", "partial", "excerpt"]);
  });
});

import { describe, expect, it } from "vitest";
import { workItems } from "@/content/work";

describe("workItems", () => {
  it("has unique slugs", () => {
    const slugs = workItems.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("is sorted by sortOrder", () => {
    const sorted = [...workItems].sort((a, b) => a.sortOrder - b.sortOrder);
    expect(workItems.map((item) => item.slug)).toEqual(sorted.map((item) => item.slug));
  });

  it("matches the expected timeline entries", () => {
    expect(workItems.map((item) => item.slug)).toEqual([
      "rho",
      "justworks",
      "stash",
      "casper",
      "peets",
      "beander",
      "wunderman-possible"
    ]);
  });

  it("matches resume chronology labels", () => {
    expect(workItems.map((item) => item.periodLabel)).toEqual([
      "Present",
      "2023-2025",
      "2021-2023",
      "2019-2021",
      "2017-2019",
      "2014-2016",
      "2011-2017"
    ]);
  });

  it("keeps impact callouts compact", () => {
    workItems.forEach((item) => {
      if (item.impactPoints) {
        expect(item.impactPoints.length).toBeGreaterThanOrEqual(1);
        expect(item.impactPoints.length).toBeLessThanOrEqual(3);
      }
    });
  });
});

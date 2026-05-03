import { describe, expect, it } from "vitest";
import { parseWorkFiltersUi, workHref } from "@/lib/work-filter-href";

describe("parseWorkFiltersUi", () => {
  it("defaults to segments", () => {
    expect(parseWorkFiltersUi(undefined)).toBe("segments");
    expect(parseWorkFiltersUi("")).toBe("segments");
    expect(parseWorkFiltersUi("unknown")).toBe("segments");
  });

  it("accepts known ui modes", () => {
    expect(parseWorkFiltersUi("facets")).toBe("facets");
    expect(parseWorkFiltersUi("transitions")).toBe("transitions");
    expect(parseWorkFiltersUi("timeline")).toBe("timeline");
    expect(parseWorkFiltersUi("filterless")).toBe("filterless");
  });
});

describe("workHref", () => {
  it("omits ui for segments default", () => {
    expect(workHref("all", "all", "segments")).toBe("/work");
    expect(workHref("product", "all", "segments")).toBe("/work?tag=product");
  });

  it("preserves ui for non-segment modes", () => {
    expect(workHref("all", "all", "facets")).toBe("/work?ui=facets");
    expect(workHref("product", "2023-2025", "transitions")).toBe("/work?tag=product&period=2023-2025&ui=transitions");
    expect(workHref("all", "all", "timeline")).toBe("/work?ui=timeline");
    expect(workHref("all", "all", "filterless")).toBe("/work?ui=filterless");
  });
});

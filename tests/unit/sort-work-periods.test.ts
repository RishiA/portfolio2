import { describe, expect, it } from "vitest";
import { sortWorkPeriodLabels } from "@/lib/sort-work-periods";

describe("sortWorkPeriodLabels", () => {
  it("orders Present first, then by start year descending", () => {
    const input = ["2014-2016", "Present", "2021-2023", "2011-2017"];
    expect(sortWorkPeriodLabels(input)).toEqual(["Present", "2021-2023", "2014-2016", "2011-2017"]);
  });

  it("is stable for empty input", () => {
    expect(sortWorkPeriodLabels([])).toEqual([]);
  });
});

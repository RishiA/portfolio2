import { describe, expect, it } from "vitest";
import { formatNoteDate, groupNotes } from "@/lib/v2/note-groups";
import { item } from "./v2-fixtures";

// 2026-11-02 15:00 UTC is 10:00 in New York (EST).
const now = new Date("2026-11-02T15:00:00.000Z");
const idsByGroup = (items: ReturnType<typeof item>[], at: Date = now) =>
  Object.fromEntries(groupNotes(items, at).map((group) => [group.id, group.items.map((entry) => entry.slug)]));

describe("groupNotes", () => {
  it("splits items into the expected groups and hides empty ones", () => {
    const groups = idsByGroup([
      item({ slug: "pinned", pinRank: 0, date: "2026-11-02T14:00:00.000Z" }),
      item({ slug: "today", date: "2026-11-02T14:00:00.000Z" }),
      item({ slug: "yesterday", date: "2026-11-01T20:00:00.000Z" }),
      item({ slug: "week", date: "2026-10-27T20:00:00.000Z" }),
      item({ slug: "month", date: "2026-10-10T20:00:00.000Z" }),
      item({ slug: "old", date: "2025-01-10T20:00:00.000Z" }),
      item({ slug: "job", collection: "work" })
    ]);
    expect(groups).toEqual({
      pinned: ["pinned"],
      today: ["today"],
      yesterday: ["yesterday"],
      "previous-7": ["week"],
      "previous-30": ["month"],
      older: ["old"],
      "work-history": ["job"]
    });
    expect(Object.keys(idsByGroup([item({ slug: "x", date: "2026-11-02T14:00:00.000Z" })]))).toEqual(["today"]);
  });

  it("returns groups in display order", () => {
    const ids = groupNotes([item({ slug: "old", date: "2020-01-01T12:00:00.000Z" }), item({ slug: "t", date: "2026-11-02T14:00:00.000Z" })], now).map((g) => g.id);
    expect(ids).toEqual(["today", "older"]);
  });

  it("uses New York day boundaries, not UTC", () => {
    // 03:00 UTC on Nov 2 is still Nov 1 in New York, so with "now" at 15:00 UTC it is yesterday.
    expect(idsByGroup([item({ slug: "late", date: "2026-11-02T03:00:00.000Z" })])).toEqual({ yesterday: ["late"] });
    // 05:30 UTC on Nov 2 is 00:30 EST, which is today.
    expect(idsByGroup([item({ slug: "early", date: "2026-11-02T05:30:00.000Z" })])).toEqual({ today: ["early"] });
  });

  it("handles the fall-back DST day (Nov 1 2026 has 25 hours)", () => {
    const after = new Date("2026-11-01T06:30:00.000Z"); // 01:30 EST, after the clocks went back
    expect(idsByGroup([item({ slug: "late", date: "2026-11-01T03:59:00.000Z" })], after)).toEqual({ yesterday: ["late"] }); // 23:59 EDT on Oct 31
    expect(idsByGroup([item({ slug: "early", date: "2026-11-01T04:30:00.000Z" })], after)).toEqual({ today: ["early"] }); // 00:30 EDT on Nov 1
  });

  it("keeps day counts correct across the spring-forward day", () => {
    const monday = new Date("2026-03-09T14:00:00.000Z"); // Mar 8 2026 is the DST start
    expect(idsByGroup([item({ slug: "sat", date: "2026-03-07T20:00:00.000Z" })], monday)).toEqual({ "previous-7": ["sat"] });
    expect(idsByGroup([item({ slug: "sun", date: "2026-03-08T20:00:00.000Z" })], monday)).toEqual({ yesterday: ["sun"] });
  });

  it("treats the 7 and 30 day edges inclusively", () => {
    expect(idsByGroup([item({ slug: "e7", date: "2026-10-26T15:00:00.000Z" })])).toEqual({ "previous-7": ["e7"] });
    expect(idsByGroup([item({ slug: "e8", date: "2026-10-25T15:00:00.000Z" })])).toEqual({ "previous-30": ["e8"] });
    expect(idsByGroup([item({ slug: "e30", date: "2026-10-03T15:00:00.000Z" })])).toEqual({ "previous-30": ["e30"] });
    expect(idsByGroup([item({ slug: "e31", date: "2026-10-02T15:00:00.000Z" })])).toEqual({ older: ["e31"] });
  });

  it("puts future dates under Today and keeps input order inside a group", () => {
    const groups = idsByGroup([
      item({ slug: "b", date: "2026-11-05T15:00:00.000Z" }),
      item({ slug: "a", date: "2026-11-02T12:00:00.000Z" })
    ]);
    expect(groups).toEqual({ today: ["b", "a"] });
  });

  it("reads date-only values (midnight UTC) as that calendar day", () => {
    expect(idsByGroup([item({ slug: "d", date: "2026-11-02T00:00:00.000Z" })])).toEqual({ today: ["d"] });
  });
});

describe("formatNoteDate", () => {
  it("formats in New York time", () => {
    expect(formatNoteDate("2026-11-02T03:00:00.000Z")).toBe("Nov 1, 2026");
    expect(formatNoteDate("2026-07-04T12:00:00.000Z")).toBe("Jul 4, 2026");
  });

  it("does not shift date-only values back a day", () => {
    expect(formatNoteDate("2026-03-01T00:00:00.000Z")).toBe("Mar 1, 2026");
  });

  it("returns an empty string for invalid input", () => {
    expect(formatNoteDate("nope")).toBe("");
  });
});

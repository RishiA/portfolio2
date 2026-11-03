import { describe, expect, it } from "vitest";
import { flattenGroups, formatNoteHeaderDate, formatSidebarDate, groupNotes } from "@/lib/v2/notes/groups";
import { item } from "./v2-notes-fixtures";

// 2026-11-02 15:00 UTC is 10:00 in New York (EST).
const now = new Date("2026-11-02T15:00:00.000Z");
const idsByGroup = (items: ReturnType<typeof item>[], at: Date = now) =>
  Object.fromEntries(groupNotes(items, at).map((group) => [group.id, group.items.map((entry) => entry.slug)]));

describe("groupNotes", () => {
  it("splits items into the sidebar groups and hides empty ones", () => {
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
      "7": ["week"],
      "30": ["month"],
      older: ["old", "job"]
    });
    expect(Object.keys(idsByGroup([item({ slug: "x", date: "2026-11-02T14:00:00.000Z" })]))).toEqual(["today"]);
  });

  it("labels the groups the way her sidebar does", () => {
    const labels = groupNotes(
      [
        item({ slug: "p", pinRank: 0 }),
        item({ slug: "t", date: "2026-11-02T14:00:00.000Z" }),
        item({ slug: "y", date: "2026-11-01T20:00:00.000Z" }),
        item({ slug: "w", date: "2026-10-27T20:00:00.000Z" }),
        item({ slug: "m", date: "2026-10-10T20:00:00.000Z" }),
        item({ slug: "o", date: "2020-01-01T12:00:00.000Z" })
      ],
      now
    ).map((group) => group.label);
    expect(labels).toEqual(["Pinned", "Today", "Yesterday", "Previous 7 Days", "Previous 30 Days", "Older"]);
  });

  it("uses New York day boundaries, not UTC", () => {
    expect(idsByGroup([item({ slug: "late", date: "2026-11-02T03:00:00.000Z" })])).toEqual({ yesterday: ["late"] });
    expect(idsByGroup([item({ slug: "early", date: "2026-11-02T05:30:00.000Z" })])).toEqual({ today: ["early"] });
  });

  it("handles the fall-back DST day and the spring-forward day", () => {
    const after = new Date("2026-11-01T06:30:00.000Z");
    expect(idsByGroup([item({ slug: "late", date: "2026-11-01T03:59:00.000Z" })], after)).toEqual({ yesterday: ["late"] });
    expect(idsByGroup([item({ slug: "early", date: "2026-11-01T04:30:00.000Z" })], after)).toEqual({ today: ["early"] });
    const monday = new Date("2026-03-09T14:00:00.000Z");
    expect(idsByGroup([item({ slug: "sat", date: "2026-03-07T20:00:00.000Z" })], monday)).toEqual({ "7": ["sat"] });
    expect(idsByGroup([item({ slug: "sun", date: "2026-03-08T20:00:00.000Z" })], monday)).toEqual({ yesterday: ["sun"] });
  });

  it("treats the 7 and 30 day edges inclusively", () => {
    expect(idsByGroup([item({ slug: "e7", date: "2026-10-26T15:00:00.000Z" })])).toEqual({ "7": ["e7"] });
    expect(idsByGroup([item({ slug: "e8", date: "2026-10-25T15:00:00.000Z" })])).toEqual({ "30": ["e8"] });
    expect(idsByGroup([item({ slug: "e30", date: "2026-10-03T15:00:00.000Z" })])).toEqual({ "30": ["e30"] });
    expect(idsByGroup([item({ slug: "e31", date: "2026-10-02T15:00:00.000Z" })])).toEqual({ older: ["e31"] });
  });

  it("keeps input order inside a group and puts future dates under Today", () => {
    expect(
      idsByGroup([item({ slug: "b", date: "2026-11-05T15:00:00.000Z" }), item({ slug: "a", date: "2026-11-02T12:00:00.000Z" })])
    ).toEqual({ today: ["b", "a"] });
  });

  it("reads date-only values (midnight UTC) as that calendar day", () => {
    expect(idsByGroup([item({ slug: "d", date: "2026-11-02T00:00:00.000Z" })])).toEqual({ today: ["d"] });
  });
});

describe("flattenGroups", () => {
  it("lists notes in the order the sidebar shows them", () => {
    const groups = groupNotes(
      [item({ slug: "old", date: "2020-01-01T12:00:00.000Z" }), item({ slug: "t", date: "2026-11-02T14:00:00.000Z" }), item({ slug: "p", pinRank: 0 })],
      now
    );
    expect(flattenGroups(groups).map((entry) => entry.slug)).toEqual(["p", "t", "old"]);
  });
});

describe("date formatting", () => {
  it("formats the sidebar date as M/D/YYYY in New York time", () => {
    expect(formatSidebarDate("2026-11-02T03:00:00.000Z")).toBe("11/1/2026");
    expect(formatSidebarDate("2026-07-04T12:00:00.000Z")).toBe("7/4/2026");
    expect(formatSidebarDate("nope")).toBe("");
  });

  it("formats the note header date with the time", () => {
    expect(formatNoteHeaderDate("2026-05-14T21:33:00.000Z")).toBe("May 14, 2026 at 5:33 PM");
  });

  it("shows date-only values without a time and without shifting the day", () => {
    expect(formatNoteHeaderDate("2026-03-01T00:00:00.000Z")).toBe("March 1, 2026");
    expect(formatSidebarDate("2026-03-01T00:00:00.000Z")).toBe("3/1/2026");
  });
});

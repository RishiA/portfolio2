// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import type { NoteListItem } from "@/lib/profile/types";

export const NOTES_TIME_ZONE = "America/New_York";

export type NoteGroupId = "pinned" | "today" | "yesterday" | "7" | "30" | "older";

export interface NoteGroup {
  id: NoteGroupId;
  label: string;
  items: NoteListItem[];
}

const GROUPS: ReadonlyArray<{ id: NoteGroupId; label: string }> = [
  { id: "pinned", label: "Pinned" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7", label: "Previous 7 Days" },
  { id: "30", label: "Previous 30 Days" },
  { id: "older", label: "Older" }
];

const MS_PER_DAY = 86_400_000;

/** Date-only values arrive as midnight UTC. Reading them in a western time zone would show the day before. */
export function isDateOnly(date: Date): boolean {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

/** Calendar day number (days since epoch) of an instant in the given time zone. */
function dayNumber(date: Date, timeZone: string): number {
  if (isDateOnly(date)) return Math.floor(date.getTime() / MS_PER_DAY);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(date);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return Math.round(Date.UTC(read("year"), read("month") - 1, read("day")) / MS_PER_DAY);
}

function groupIdFor(item: NoteListItem, today: number, timeZone: string): NoteGroupId {
  if (item.pinRank !== undefined) return "pinned";
  const time = item.date ? Date.parse(item.date) : Number.NaN;
  if (Number.isNaN(time)) return "older";
  const age = today - dayNumber(new Date(time), timeZone);
  if (age <= 0) return "today";
  if (age === 1) return "yesterday";
  if (age <= 7) return "7";
  if (age <= 30) return "30";
  return "older";
}

/** Splits items into the sidebar groups. Order inside a group follows the input order. Empty groups are dropped. */
export function groupNotes(items: readonly NoteListItem[], now: Date, timeZone: string = NOTES_TIME_ZONE): NoteGroup[] {
  const today = dayNumber(now, timeZone);
  const buckets = new Map<NoteGroupId, NoteListItem[]>();
  for (const item of items) {
    const id = groupIdFor(item, today, timeZone);
    buckets.set(id, [...(buckets.get(id) ?? []), item]);
  }
  return GROUPS.flatMap(({ id, label }) => {
    const groupItems = buckets.get(id);
    return groupItems?.length ? [{ id, label, items: groupItems }] : [];
  });
}

/** The notes in the order the sidebar shows them. */
export function flattenGroups(groups: readonly NoteGroup[]): NoteListItem[] {
  return groups.flatMap((group) => group.items);
}

/** Sidebar date, for example "11/3/2026". */
export function formatSidebarDate(iso: string, timeZone: string = NOTES_TIME_ZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: isDateOnly(date) ? "UTC" : timeZone,
    month: "numeric",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

/** Note header date, for example "November 3, 2026 at 9:48 AM". Date-only values have no time. */
export function formatNoteHeaderDate(iso: string, timeZone: string = NOTES_TIME_ZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const dateOnly = isDateOnly(date);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: dateOnly ? "UTC" : timeZone,
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
  if (dateOnly) return day;
  const time = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(date);
  return `${day} at ${time}`;
}

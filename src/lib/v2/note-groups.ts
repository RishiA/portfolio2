import type { NoteListItem } from "@/lib/profile/types";

export const NOTES_TIME_ZONE = "America/New_York";

export type NoteGroupId = "pinned" | "today" | "yesterday" | "previous-7" | "previous-30" | "older" | "work-history";

export interface NoteGroup {
  id: NoteGroupId;
  label: string;
  items: NoteListItem[];
}

const GROUPS: ReadonlyArray<{ id: NoteGroupId; label: string }> = [
  { id: "pinned", label: "Pinned" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "previous-7", label: "Previous 7 days" },
  { id: "previous-30", label: "Previous 30 days" },
  { id: "older", label: "Older" },
  { id: "work-history", label: "Work history" }
];

const MS_PER_DAY = 86_400_000;

/** Date-only values arrive as midnight UTC. Reading them in a western time zone would show the day before. */
function isDateOnly(date: Date): boolean {
  return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;
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
  if (Number.isNaN(time)) return "work-history";
  const age = today - dayNumber(new Date(time), timeZone);
  if (age <= 0) return "today";
  if (age === 1) return "yesterday";
  if (age <= 7) return "previous-7";
  if (age <= 30) return "previous-30";
  return "older";
}

/** Splits items into display groups. Order inside a group follows the input order. Empty groups are dropped. */
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

/** Short date such as "Mar 3, 2026" in the given time zone. */
export function formatNoteDate(iso: string, timeZone: string = NOTES_TIME_ZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: isDateOnly(date) ? "UTC" : timeZone,
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

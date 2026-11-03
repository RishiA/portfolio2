// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import type { NoteListItem } from "@/lib/profile/types";

function rank(item: NoteListItem, needle: string): number {
  const title = item.title.toLowerCase();
  if (title === needle) return 3;
  if (title.includes(needle)) return 2;
  if (item.excerpt.toLowerCase().includes(needle)) return 1;
  return 0;
}

/** Matches title and excerpt. An exact title match comes first, then title matches, then excerpt matches. */
export function searchNotes(items: readonly NoteListItem[], query: string): NoteListItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];
  return items
    .map((item, index) => ({ item, index, score: rank(item, needle) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
}

/** The part of the excerpt around the first match, so the match stays visible in a one-line preview. */
export function searchPreviewText(excerpt: string, query: string, contextLength = 84): string {
  const needle = query.trim().toLowerCase();
  if (!needle) return excerpt;
  const matchIndex = excerpt.toLowerCase().indexOf(needle);
  if (matchIndex < 0) return excerpt;

  const start = Math.max(0, matchIndex - Math.min(18, Math.floor(contextLength / 4)));
  const end = Math.min(excerpt.length, Math.max(start + contextLength, matchIndex + needle.length));
  const text = excerpt.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${text}${end < excerpt.length ? "…" : ""}`;
}

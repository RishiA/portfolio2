import type { NoteCollection, NoteListItem } from "@/lib/profile/types";

export type CollectionId = "all" | NoteCollection;

export const COLLECTIONS: ReadonlyArray<{ id: CollectionId; label: string }> = [
  { id: "all", label: "All" },
  { id: "work", label: "Work" },
  { id: "playground", label: "Playground" },
  { id: "writing", label: "Writing" },
  { id: "notes", label: "Notes" }
];

export function isCollectionId(value: unknown): value is CollectionId {
  return COLLECTIONS.some((collection) => collection.id === value);
}

/** "All" shows everything, including landing notes. Other collections show only their own items. */
export function filterByCollection(items: readonly NoteListItem[], collection: CollectionId): NoteListItem[] {
  return collection === "all" ? [...items] : items.filter((item) => item.collection === collection);
}

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

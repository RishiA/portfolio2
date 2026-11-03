import type { NoteDetail, NoteListItem } from "@/lib/profile/types";

// Module state survives Notes closing and reopening within one page session.
let cachedList: NoteListItem[] | null = null;
const cachedDetails = new Map<string, NoteDetail>();
let lastSelectedSlug: string | null = null;

export function seedNotesCache(list?: NoteListItem[], detail?: NoteDetail): void {
  if (list && !cachedList) cachedList = list;
  if (detail && !cachedDetails.has(detail.item.slug)) cachedDetails.set(detail.item.slug, detail);
}

export function getCachedList(): NoteListItem[] | null {
  return cachedList;
}

export function getCachedDetail(slug: string): NoteDetail | null {
  return cachedDetails.get(slug) ?? null;
}

export function getLastSelectedSlug(): string | null {
  return lastSelectedSlug;
}

export function rememberSelectedSlug(slug: string): void {
  lastSelectedSlug = slug;
}

export const NOTE_SELECT_EVENT = "v2-notes-select";

/** Asks the Notes app to show a note. Works whether or not the Notes window is open yet. */
export function requestNoteSelection(slug: string): void {
  lastSelectedSlug = slug;
  window.dispatchEvent(new CustomEvent<string>(NOTE_SELECT_EVENT, { detail: slug }));
}

export function resetNotesCache(): void {
  cachedList = null;
  cachedDetails.clear();
  lastSelectedSlug = null;
}

export async function fetchNoteList(): Promise<NoteListItem[] | null> {
  if (cachedList) return cachedList;
  try {
    const response = await fetch("/api/v2/notes");
    if (!response.ok) return null;
    const body = (await response.json()) as { notes?: NoteListItem[] };
    if (!Array.isArray(body.notes)) return null;
    cachedList = body.notes;
    return cachedList;
  } catch {
    return null;
  }
}

export async function fetchNoteDetail(slug: string): Promise<NoteDetail | null> {
  const cached = cachedDetails.get(slug);
  if (cached) return cached;
  try {
    const response = await fetch(`/api/v2/notes/${encodeURIComponent(slug)}`);
    if (!response.ok) return null;
    const body = (await response.json()) as { note?: NoteDetail };
    if (!body.note) return null;
    cachedDetails.set(slug, body.note);
    return body.note;
  } catch {
    return null;
  }
}

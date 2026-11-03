import { getNoteDetail, getNoteList } from "@/lib/profile";
import type { ShellBoot } from "@/lib/v2/shell-boot-context";

/** The note that opens when the URL names none. */
export const DEFAULT_NOTE_SLUG = "about-me";

/** Server-side data the Notes app starts with. A missing slug loads the default note. */
export async function loadNotesBoot(slug?: string): Promise<Pick<ShellBoot, "initialNoteSlug" | "initialNotes" | "initialNote">> {
  const [initialNotes, detail] = await Promise.all([getNoteList(), getNoteDetail(slug ?? DEFAULT_NOTE_SLUG)]);
  return { initialNoteSlug: slug, initialNotes, initialNote: detail ?? undefined };
}

import type { NoteDetail } from "@/lib/profile/types";
import { formatNoteHeaderDate } from "./groups";

/** Text for the centered line at the top of a note. Null when the note has nothing to show. */
export function noteDateLine(detail: NoteDetail): string | null {
  switch (detail.kind) {
    case "work":
      return detail.source.periodLabel || null;
    case "post": {
      const date = detail.item.date ? formatNoteHeaderDate(detail.item.date) : "";
      if (!date) return `${detail.source.readingTimeMinutes} min read`;
      return `${date} · ${detail.source.readingTimeMinutes} min read`;
    }
    default:
      return detail.item.date ? formatNoteHeaderDate(detail.item.date) || null : null;
  }
}

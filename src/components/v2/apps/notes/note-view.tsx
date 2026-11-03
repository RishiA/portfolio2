"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import type { NoteDetail, NoteListItem } from "@/lib/profile/types";
import { formatNoteHeaderDate } from "@/lib/v2/notes/groups";
import { noteDateLine } from "@/lib/v2/notes/date-line";
import { NoteBody } from "./note-body";
import { NoteHeader } from "./note-header";

interface NoteViewProps {
  item: NoteListItem;
  /** Null while the note body is loading or when loading failed. */
  detail: NoteDetail | null;
  failed: boolean;
  onBack?: () => void;
}

/** The reading pane: header from the list item, body once the detail has arrived. */
export function NoteView({ item, detail, failed, onBack }: NoteViewProps) {
  const dateLine = detail ? noteDateLine(detail) : item.date ? formatNoteHeaderDate(item.date) : null;
  return (
    <div className="h-full overflow-y-auto bg-background">
      <NoteHeader emoji={item.emoji} title={item.title} dateLine={dateLine} onBack={onBack} />
      <div className="px-2 relative">
        <div className="v2-notes-body text-base desktop:text-sm">
          {detail ? <NoteBody detail={detail} /> : failed ? <p>This note could not be loaded.</p> : null}
        </div>
      </div>
    </div>
  );
}

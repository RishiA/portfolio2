"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import type { RefObject } from "react";
import type { NoteDetail, NoteListItem } from "@/lib/profile/types";
import { BackToNotes } from "./note-header";
import { NoteView } from "./note-view";
import { Sidebar } from "./sidebar";

interface MobilePresenterProps {
  containerRef: RefObject<HTMLDivElement | null>;
  notes: NoteListItem[] | null;
  selectedSlug: string | null;
  selectedItem: NoteListItem | null;
  detail: NoteDetail | null;
  failed: boolean;
  onSelect: (slug: string) => void;
  onBack: () => void;
}

export function MobilePresenter({ containerRef, notes, selectedSlug, selectedItem, detail, failed, onSelect, onBack }: MobilePresenterProps) {
  return (
    <div
      ref={containerRef}
      data-app="notes"
      data-testid="app-window-notes"
      tabIndex={-1}
      onMouseDown={() => containerRef.current?.focus()}
      className="v2-notes-app h-full bg-background text-foreground outline-none"
    >
      {selectedSlug === null ? (
        notes ? (
          <Sidebar notes={notes} selectedSlug={null} isMobile onSelect={onSelect} />
        ) : (
          <div className="h-full bg-background" />
        )
      ) : (
        <div className="h-full p-3">
          {selectedItem ? (
            <NoteView item={selectedItem} detail={detail} failed={failed} onBack={onBack} />
          ) : (
            <BackToNotes onBack={onBack} />
          )}
        </div>
      )}
    </div>
  );
}

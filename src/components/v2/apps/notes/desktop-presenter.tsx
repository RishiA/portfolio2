"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import type { RefObject } from "react";
import type { NoteDetail, NoteListItem } from "@/lib/profile/types";
import { useWindowFocus } from "@/lib/v2/window-focus-context";
import { NoteView } from "./note-view";
import { ScrollArea } from "./scroll-area";
import { Sidebar } from "./sidebar";

interface DesktopPresenterProps {
  containerRef: RefObject<HTMLDivElement | null>;
  notes: NoteListItem[];
  selectedSlug: string | null;
  selectedItem: NoteListItem | null;
  detail: NoteDetail | null;
  failed: boolean;
  onSelect: (slug: string) => void;
}

export function DesktopPresenter({ containerRef, notes, selectedSlug, selectedItem, detail, failed, onSelect }: DesktopPresenterProps) {
  const windowFocus = useWindowFocus();

  return (
    <div
      ref={containerRef}
      data-app="notes"
      data-testid="app-window-notes"
      tabIndex={-1}
      onMouseDown={() => containerRef.current?.focus()}
      className="v2-notes-app h-full flex bg-background text-foreground relative outline-none"
    >
      <Sidebar notes={notes} selectedSlug={selectedSlug} isMobile={false} onSelect={onSelect} />
      <div className="flex-grow h-full overflow-hidden relative">
        {windowFocus && (
          <div
            className="absolute top-0 left-0 right-0 h-[52px] z-10 select-none"
            onMouseDown={(e) => {
              const overlay = e.currentTarget as HTMLElement;
              const startX = e.clientX;
              const startY = e.clientY;
              let didDrag = false;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const dx = Math.abs(moveEvent.clientX - startX);
                const dy = Math.abs(moveEvent.clientY - startY);
                if (!didDrag && (dx > 5 || dy > 5)) {
                  didDrag = true;
                  windowFocus.onDragStart(e);
                }
              };

              const handleMouseUp = (upEvent: MouseEvent) => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);

                if (!didDrag) {
                  overlay.style.pointerEvents = "none";
                  const elementBelow = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
                  overlay.style.pointerEvents = "";
                  if (elementBelow && elementBelow !== overlay) {
                    (elementBelow as HTMLElement).click();
                  }
                }
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />
        )}
        <ScrollArea key={selectedSlug ?? "empty-note"} className="h-full" isMobile={false}>
          {selectedItem ? (
            <div className="w-full min-h-full p-3">
              <NoteView item={selectedItem} detail={detail} failed={failed} />
            </div>
          ) : (
            <div className="h-full bg-background" />
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

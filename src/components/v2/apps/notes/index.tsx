"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useRef } from "react";
import type { V2AppProps } from "@/components/v2/apps/types";
import { DesktopPresenter } from "./desktop-presenter";
import { MobilePresenter } from "./mobile-presenter";
import { NoteLinkContext } from "./note-link-context";
import { useNotes } from "./use-notes";
import "./notes.css";

export default function NotesApp({ isMobile = false }: V2AppProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { notes, selectedSlug, selectedItem, detail, failed, select, back } = useNotes(isMobile);

  return (
    <NoteLinkContext.Provider value={select}>
      {isMobile ? (
        <MobilePresenter
          containerRef={containerRef}
          notes={notes}
          selectedSlug={selectedSlug}
          selectedItem={selectedItem}
          detail={detail}
          failed={failed}
          onSelect={select}
          onBack={back}
        />
      ) : notes ? (
        <DesktopPresenter
          containerRef={containerRef}
          notes={notes}
          selectedSlug={selectedSlug}
          selectedItem={selectedItem}
          detail={detail}
          failed={failed}
          onSelect={select}
        />
      ) : (
        <div className="h-full bg-background" data-testid="app-window-notes" />
      )}
    </NoteLinkContext.Provider>
  );
}

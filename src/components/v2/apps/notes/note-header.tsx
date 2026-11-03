"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { ChevronLeft } from "lucide-react";

interface NoteHeaderProps {
  emoji?: string;
  title: string;
  dateLine: string | null;
  /** Mobile only: label and handler of the "Notes" back button above the date line. */
  onBack?: () => void;
}

export function BackToNotes({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" onClick={onBack} className="pt-2 flex items-center">
      <ChevronLeft className="text-[#e2a727]" size={32} aria-hidden />
      <span className="text-[#e2a727] text-base ml-1">Notes</span>
    </button>
  );
}

export function NoteHeader({ emoji, title, dateLine, onBack }: NoteHeaderProps) {
  return (
    <>
      {onBack ? <BackToNotes onBack={onBack} /> : null}
      <div className="px-2 mb-4 relative">
        <div className="relative flex min-h-6 items-center justify-center">
          <p className="text-muted-foreground text-xs">{dateLine ?? " "}</p>
        </div>
        <div className="flex items-center relative">
          {emoji ? <span className="mr-2">{emoji}</span> : null}
          <h1 className="text-2xl font-bold flex-grow py-2 leading-normal min-h-[50px]">{title}</h1>
        </div>
      </div>
    </>
  );
}

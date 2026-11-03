"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { NoteDetail, NoteListItem } from "@/lib/profile/types";

/** Values the /v2 route passes to the apps on first load, e.g. the note slug from /v2/notes/[slug]. */
export interface ShellBoot {
  initialNoteSlug?: string;
  /** Note list fetched on the server. Absent when the route is not a Notes route. */
  initialNotes?: NoteListItem[];
  /** Detail of the note in the URL, or of the default note on /v2. */
  initialNote?: NoteDetail;
}

const ShellBootContext = createContext<ShellBoot>({});

export function ShellBootProvider({ value, children }: { value: ShellBoot; children: ReactNode }) {
  return <ShellBootContext.Provider value={value}>{children}</ShellBootContext.Provider>;
}

export function useShellBoot(): ShellBoot {
  return useContext(ShellBootContext);
}

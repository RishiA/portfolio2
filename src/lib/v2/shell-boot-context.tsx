"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Values the /v2 route passes to the apps on first load, e.g. the note slug from /v2/notes/[slug]. */
export interface ShellBoot {
  initialNoteSlug?: string;
}

const ShellBootContext = createContext<ShellBoot>({});

export function ShellBootProvider({ value, children }: { value: ShellBoot; children: ReactNode }) {
  return <ShellBootContext.Provider value={value}>{children}</ShellBootContext.Provider>;
}

export function useShellBoot(): ShellBoot {
  return useContext(ShellBootContext);
}

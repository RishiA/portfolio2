"use client";

import { createContext, useContext } from "react";

/** Lets links inside a note select another note in the same window instead of loading a page. */
export const NoteLinkContext = createContext<(slug: string) => void>(() => undefined);

export function useSelectNote(): (slug: string) => void {
  return useContext(NoteLinkContext);
}

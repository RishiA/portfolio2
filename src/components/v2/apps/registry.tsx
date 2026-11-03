"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import NotesApp from "./notes";
import type { V2AppProps } from "./types";

// Notes is the default app, so it loads with the shell. The other apps load when first opened.
const APP_COMPONENTS: Record<string, ComponentType<V2AppProps>> = {
  notes: NotesApp,
  terminal: dynamic(() => import("./terminal")),
  photos: dynamic(() => import("./photos")),
  music: dynamic(() => import("./music")),
  settings: dynamic(() => import("./settings")),
  trash: dynamic(() => import("./trash"))
};

export function AppBody({ appId, isMobile = false }: { appId: string; isMobile?: boolean }) {
  const App = APP_COMPONENTS[appId];
  return App ? <App isMobile={isMobile} /> : null;
}

"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useCallback } from "react";
import { WindowControls } from "@/components/v2/desktop/window-controls";
import { WindowNavShell, WindowNavSpacer } from "@/components/v2/desktop/window-nav-shell";
import type { V2AppProps } from "@/components/v2/apps/types";
import { requestNoteSelection } from "@/lib/v2/notes/client";
import { SHELL_NOTES_ROOT_PATH } from "@/lib/v2/shell-routing";
import { useWindowNavBehavior } from "@/lib/v2/use-window-nav-behavior";
import { useWindowManager } from "@/lib/v2/window-context";
import { Terminal } from "./Terminal";

const SESSION_TITLE = "rishi — zsh";

export default function TerminalApp({ isMobile = false }: V2AppProps) {
  const nav = useWindowNavBehavior({ isDesktop: !isMobile, isMobile });
  const { openWindow, unminimizeWindow, getWindow } = useWindowManager();

  const openNote = useCallback(
    (href: string) => {
      requestNoteSelection(decodeURIComponent(href.slice(`${SHELL_NOTES_ROOT_PATH}/`.length)));
      openWindow("notes");
      if (getWindow("notes")?.isMinimized) unminimizeWindow("notes");
    },
    [openWindow, unminimizeWindow, getWindow]
  );

  return (
    <div
      data-testid="app-window-terminal"
      data-app="terminal"
      className="flex h-full flex-col overflow-hidden bg-white text-zinc-900 outline-none dark:bg-zinc-900 dark:text-white"
    >
      <WindowNavShell
        isMobile={isMobile}
        onMouseDown={nav.onDragStart}
        className="min-w-0"
        left={
          <WindowControls
            inShell={nav.inShell}
            showWhenNotInShell={false}
            className="p-2"
            onClose={nav.onClose}
            onMinimize={nav.onMinimize}
            onToggleMaximize={nav.onToggleMaximize}
            isMaximized={nav.isMaximized}
            closeLabel={nav.closeLabel}
          />
        }
        center={
          <span
            className="flex min-w-0 items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground"
            aria-label={`Terminal session, ${SESSION_TITLE}`}
            title={SESSION_TITLE}
          >
            <span
              aria-hidden="true"
              className="flex size-3.5 shrink-0 items-center justify-center rounded-[1px] bg-foreground font-mono text-[8px] font-bold leading-none text-background"
            >
              &gt;_
            </span>
            <span className="truncate">{SESSION_TITLE}</span>
          </span>
        }
        centerClassName="px-3"
        right={<WindowNavSpacer isMobile={isMobile} />}
      />
      <div className="min-h-0 flex-1 overflow-hidden bg-background">
        <Terminal onOpenNote={openNote} />
      </div>
    </div>
  );
}

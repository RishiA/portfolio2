"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { WindowControls } from "./window-controls";
import { WindowNavShell } from "./window-nav-shell";
import { useWindowNavBehavior } from "@/lib/v2/use-window-nav-behavior";

interface AppPlaceholderProps {
  name: string;
  isMobile?: boolean;
}

/** Window body used until each app is built. Sits inside the same chrome the real apps will use. */
export function AppPlaceholder({ name, isMobile = false }: AppPlaceholderProps) {
  const nav = useWindowNavBehavior({ isDesktop: !isMobile, isMobile });

  return (
    <div className="flex h-full flex-col bg-background" data-testid={`app-window-${name.toLowerCase()}`}>
      <WindowNavShell
        isMobile={isMobile}
        onMouseDown={nav.onDragStart}
        left={
          <WindowControls
            inShell={nav.inShell}
            showWhenNotInShell={false}
            onClose={nav.onClose}
            onMinimize={nav.onMinimize}
            onToggleMaximize={nav.onToggleMaximize}
            isMaximized={nav.isMaximized}
            closeLabel={nav.closeLabel}
          />
        }
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        <h1 className="text-lg font-semibold text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}

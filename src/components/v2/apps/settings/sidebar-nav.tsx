"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { WindowControls } from "@/components/v2/desktop/window-controls";
import { WindowNavShell, WindowNavSpacer } from "@/components/v2/desktop/window-nav-shell";
import { useWindowNavBehavior } from "@/lib/v2/use-window-nav-behavior";

interface SidebarNavProps {
  isScrolled?: boolean;
  isDesktop?: boolean;
}

export function SidebarNav({ isScrolled, isDesktop = false }: SidebarNavProps) {
  const nav = useWindowNavBehavior({ isDesktop, isMobile: false });

  return (
    <WindowNavShell
      isMobile={false}
      isScrolled={isScrolled}
      onMouseDown={nav.onDragStart}
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
      right={<WindowNavSpacer isMobile={false} />}
    />
  );
}

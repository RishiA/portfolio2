"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { WindowControls } from "@/components/v2/desktop/window-controls";
import { WindowNavShell } from "@/components/v2/desktop/window-nav-shell";
import { useWindowNavBehavior } from "@/lib/v2/use-window-nav-behavior";
import { cn } from "@/lib/v2/utils";

interface NavProps {
  isMobile: boolean;
  isScrolled: boolean;
}

/** Sidebar header: the window's traffic lights. The display menu and new-note button are not part of the read-only app. */
export function Nav({ isMobile, isScrolled }: NavProps) {
  const nav = useWindowNavBehavior({ isDesktop: !isMobile, isMobile });

  return (
    <WindowNavShell
      isMobile={isMobile}
      isScrolled={isScrolled}
      className={cn(isMobile && "bg-[#F2F2F7] dark:bg-black")}
      onMouseDown={nav.onDragStart}
      left={
        <div className="flex items-center gap-1">
          <WindowControls
            inShell={nav.inShell}
            className="p-2"
            onClose={nav.onClose}
            onMinimize={nav.onMinimize}
            onToggleMaximize={nav.onToggleMaximize}
            isMaximized={nav.isMaximized}
            closeLabel={nav.closeLabel}
          />
        </div>
      }
      right={<div className="h-8" />}
    />
  );
}

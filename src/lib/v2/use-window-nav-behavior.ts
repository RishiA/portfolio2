"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useWindowFocus } from "@/lib/v2/window-focus-context";

interface UseWindowNavBehaviorProps {
  isDesktop?: boolean;
  isMobile?: boolean;
  shellEnabled?: boolean;
  allowStandaloneClose?: boolean;
}

export function useWindowNavBehavior({
  isDesktop = false,
  isMobile = false,
  shellEnabled = true,
  allowStandaloneClose = true,
}: UseWindowNavBehaviorProps) {
  const windowFocus = useWindowFocus();
  const inShell = !!(shellEnabled && isDesktop && windowFocus);

  return {
    inShell,
    onDragStart: inShell ? windowFocus?.onDragStart : undefined,
    onClose: inShell
      ? windowFocus?.closeWindow
      : allowStandaloneClose && !isMobile
        ? () => window.close()
        : undefined,
    onMinimize: inShell ? windowFocus?.minimizeWindow : undefined,
    onToggleMaximize: inShell ? windowFocus?.toggleMaximize : undefined,
    isMaximized: windowFocus?.isMaximized ?? false,
    closeLabel: inShell ? "Close window" : "Close tab",
  };
}

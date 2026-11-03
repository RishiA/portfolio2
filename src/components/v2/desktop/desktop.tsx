"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useCallback, useEffect } from "react";
import { WindowManagerProvider, useWindowManager } from "@/lib/v2/window-context";
import { useSystemSettings } from "@/lib/v2/system-settings-context";
import { WINDOWED_APPS } from "@/lib/v2/app-config";
import { setUrl } from "@/lib/v2/set-url";
import { getShellUrlForApp, SHELL_BASE_PATH } from "@/lib/v2/shell-routing";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/v2/ui/context-menu";
import { MenuBar } from "./menu-bar";
import { Dock } from "./dock";
import { Window } from "./window";
import { AppBody } from "@/components/v2/apps/registry";

interface DesktopProps {
  initialAppId?: string;
  initialNoteSlug?: string;
}

function DesktopContent({ initialNoteSlug }: { initialNoteSlug?: string }) {
  const { state, getWindow, openWindow, focusWindow, unminimizeWindow } = useWindowManager();
  const { wallpaperUrl } = useSystemSettings();

  // Keep the URL in step with the focused window.
  useEffect(() => {
    const focusedAppId = state.focusedWindowId;
    if (!focusedAppId) {
      setUrl(SHELL_BASE_PATH);
      return;
    }

    const nextUrl = getShellUrlForApp(focusedAppId, {
      context: "desktop",
      currentPathname: window.location.pathname,
      noteSlug: initialNoteSlug,
    });
    if (nextUrl) {
      setUrl(nextUrl);
    }
  }, [state.focusedWindowId, initialNoteSlug]);

  const handleOpenSettings = useCallback(() => {
    const settingsWindow = getWindow("settings");
    if (settingsWindow?.isOpen) {
      if (settingsWindow.isMinimized) {
        unminimizeWindow("settings");
      } else {
        focusWindow("settings");
      }
    } else {
      openWindow("settings");
    }
  }, [focusWindow, getWindow, openWindow, unminimizeWindow]);

  return (
    <div className="fixed inset-0" data-shell="desktop" data-testid="desktop">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="absolute inset-0 bg-cover bg-center [background-image:var(--v2-wallpaper)]"
            data-desktop-wallpaper
            style={wallpaperUrl ? { backgroundImage: `url(${JSON.stringify(wallpaperUrl)})` } : undefined}
          />
        </ContextMenuTrigger>
        <ContextMenuContent
          data-desktop-context-menu
          className="min-w-0 w-max rounded-lg border-black/10 bg-white/95 p-0 py-1 text-xs shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-800/95"
        >
          <ContextMenuItem
            onSelect={handleOpenSettings}
            className="rounded-none px-3 py-1.5 text-xs focus:bg-blue-500 focus:text-white can-hover:hover:bg-blue-500 can-hover:hover:text-white"
          >
            Change Wallpaper…
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <MenuBar onOpenSettings={handleOpenSettings} />

      {WINDOWED_APPS.map((app) => (
        <Window key={app.id} appId={app.id}>
          <AppBody appId={app.id} />
        </Window>
      ))}

      <Dock />
    </div>
  );
}

export function Desktop({ initialAppId, initialNoteSlug }: DesktopProps) {
  return (
    <WindowManagerProvider key={initialAppId || "default"} initialAppId={initialAppId}>
      <DesktopContent initialNoteSlug={initialNoteSlug} />
    </WindowManagerProvider>
  );
}

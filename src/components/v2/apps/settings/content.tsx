"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import type { SettingsCategory } from "@/lib/v2/settings/navigation";
import { getCategory } from "./categories";
import { AppearancePanel } from "./panels/appearance";
import { DesktopDockPanel } from "./panels/desktop-dock";
import { MenuBarPanel } from "./panels/menu-bar";
import { WallpaperPanel } from "./panels/wallpaper";

export function Content({ selectedCategory }: { selectedCategory: SettingsCategory }) {
  if (selectedCategory === "appearance") {
    const info = getCategory("appearance");
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div data-setting-search-id="appearance-header" className="flex flex-col items-center border-b border-border/50 px-4 py-8">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            {info.icon("h-8 w-8")}
          </div>
          <h1 className="mb-1 text-base font-semibold">{info.name}</h1>
          <p className="max-w-md text-center text-xs text-muted-foreground">{info.description}</p>
        </div>
        <div className="p-4">
          <AppearancePanel />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {selectedCategory === "wallpaper" && <WallpaperPanel />}
      {selectedCategory === "desktop-dock" && <DesktopDockPanel />}
      {selectedCategory === "menu-bar" && <MenuBarPanel />}
    </div>
  );
}

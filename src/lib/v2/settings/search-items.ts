// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import type { SettingsCategory } from "./navigation";

export interface SettingsSearchItem {
  id: string;
  label: string;
  category: SettingsCategory;
  keywords: string[];
}

export const SETTINGS_CATEGORY_LABELS: Record<SettingsCategory, string> = {
  appearance: "Appearance",
  wallpaper: "Wallpaper",
  "desktop-dock": "Desktop & Dock",
  "menu-bar": "Menu Bar"
};

export const SETTINGS_SEARCH_ITEMS: SettingsSearchItem[] = [
  { id: "appearance", label: "Appearance", category: "appearance", keywords: ["light", "dark", "theme", "mode"] },
  { id: "wallpaper", label: "Wallpaper", category: "wallpaper", keywords: ["background", "desktop", "gradient", "photo"] },
  { id: "desktop-dock", label: "Desktop & Dock", category: "desktop-dock", keywords: ["applications", "desktop", "dock"] },
  {
    id: "dock-indicators",
    label: "Show indicators for open applications",
    category: "desktop-dock",
    keywords: ["dock", "running apps", "dots"]
  },
  {
    id: "menu-bar-background",
    label: "Show menu bar background",
    category: "menu-bar",
    keywords: ["contrast", "transparent", "menu bar"]
  },
  {
    id: "clock",
    label: "Clock Options",
    category: "menu-bar",
    keywords: ["time", "date", "weekday", "seconds", "digital", "analog"]
  }
];

export function searchSettings(query: string): SettingsSearchItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [];

  return SETTINGS_SEARCH_ITEMS.filter((item) =>
    [item.label, ...item.keywords].join(" ").toLocaleLowerCase().includes(normalizedQuery)
  );
}

export function getNextSettingsSearchResultIndex(currentIndex: number, resultCount: number, direction: 1 | -1): number {
  if (resultCount <= 0) return 0;
  return (currentIndex + direction + resultCount) % resultCount;
}

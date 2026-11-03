// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import { ImageIcon, Paintbrush, PanelBottom, PanelTop } from "lucide-react";
import type { SettingsCategory } from "@/lib/v2/settings/navigation";

export interface CategoryInfo {
  id: SettingsCategory;
  name: string;
  description: string;
  iconBg: string;
  icon: (className: string) => React.ReactNode;
  keywords: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "appearance",
    name: "Appearance",
    description: "Choose between a light or dark look for the desktop and its windows.",
    iconBg: "bg-blue-500",
    icon: (className) => <Paintbrush className={className} />,
    keywords: ["light", "dark", "theme", "mode"]
  },
  {
    id: "wallpaper",
    name: "Wallpaper",
    description: "Pick a gradient or a photo for the desktop.",
    iconBg: "bg-gradient-to-b from-cyan-400 to-blue-500",
    icon: (className) => <ImageIcon className={className} />,
    keywords: ["wallpaper", "background", "desktop", "gradient", "photo", "photos"]
  },
  {
    id: "desktop-dock",
    name: "Desktop & Dock",
    description: "Choose how items appear in the Dock.",
    iconBg: "bg-gray-500",
    icon: (className) => <PanelBottom className={className} />,
    keywords: ["desktop", "dock", "open", "applications", "indicators", "dots"]
  },
  {
    id: "menu-bar",
    name: "Menu Bar",
    description: "Choose how the clock and background appear in the menu bar.",
    iconBg: "bg-gray-500",
    icon: (className) => <PanelTop className={className} />,
    keywords: ["menu bar", "clock", "time", "date", "seconds"]
  }
];

export function getCategory(id: SettingsCategory): CategoryInfo {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0];
}

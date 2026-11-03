// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import type { V2AppId } from "@/components/v2/desktop/app-icons";
import type { AppConfig, Position, Size } from "./types";

type V2AppConfig = AppConfig & { id: V2AppId };

const NOTES_ONLY_ON_PHONES = { supported: false, shellFallbackAppId: "notes" } as const;

/** The five apps, in Dock order. */
export const APPS: V2AppConfig[] = [
  {
    id: "notes",
    name: "Notes",
    defaultPosition: { x: 150, y: 40 },
    defaultSize: { width: 1000, height: 700 },
    minSize: { width: 600, height: 400 },
    menuBarTitle: "Notes",
    mobile: { supported: true }
  },
  {
    id: "terminal",
    name: "Terminal",
    defaultPosition: { x: 120, y: 70 },
    defaultSize: { width: 800, height: 500 },
    minSize: { width: 500, height: 300 },
    menuBarTitle: "Terminal",
    mobile: NOTES_ONLY_ON_PHONES
  },
  {
    id: "photos",
    name: "Photos",
    defaultPosition: { x: 130, y: 60 },
    defaultSize: { width: 960, height: 650 },
    minSize: { width: 960, height: 450 },
    menuBarTitle: "Photos",
    mobile: { supported: true }
  },
  {
    id: "music",
    name: "Music",
    defaultPosition: { x: 140, y: 70 },
    defaultSize: { width: 900, height: 650 },
    minSize: { width: 600, height: 450 },
    menuBarTitle: "Music",
    mobile: { supported: true }
  },
  {
    id: "settings",
    name: "Settings",
    defaultPosition: { x: 200, y: 100 },
    defaultSize: { width: 900, height: 600 },
    minSize: { width: 700, height: 400 },
    menuBarTitle: "Settings",
    mobile: NOTES_ONLY_ON_PHONES
  }
];

/** The Trash window is opened from the Dock but is not one of the five apps. */
export const TRASH_WINDOW_ID = "trash";

const TRASH_WINDOW: AppConfig = {
  id: TRASH_WINDOW_ID,
  name: "Trash",
  defaultPosition: { x: 260, y: 110 },
  defaultSize: { width: 640, height: 420 },
  minSize: { width: 400, height: 300 },
  menuBarTitle: "Trash",
  mobile: NOTES_ONLY_ON_PHONES
};

/** Every app that can own a window: the five apps plus Trash. */
export const WINDOWED_APPS: AppConfig[] = [...APPS, TRASH_WINDOW];

export function getAppById(id: string): AppConfig | undefined {
  return WINDOWED_APPS.find((app) => app.id === id);
}

export function clampAppWindowSize(appId: string, size: Size): Size {
  const minSize = getAppById(appId)?.minSize;
  if (!minSize) return size;

  return {
    width: Math.max(size.width, minSize.width),
    height: Math.max(size.height, minSize.height)
  };
}

export function migrateAppWindowFrame(
  appId: string,
  position: Position,
  size: Size,
  viewportWidth?: number
): { position: Position; size: Size } {
  const nextSize = clampAppWindowSize(appId, size);
  const didWidthResize = nextSize.width !== size.width;

  if (!didWidthResize || viewportWidth === undefined) {
    return { position, size: nextSize };
  }

  return {
    position: {
      ...position,
      x: Math.min(position.x, Math.max(0, viewportWidth - nextSize.width))
    },
    size: nextSize
  };
}

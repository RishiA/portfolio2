// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
/**
 * Browser storage boundary for desktop window state.
 *
 * Window state is tab-scoped runtime state: a refresh restores the current
 * desktop, while a new tab or browser session starts with its own desktop.
 */

export const WINDOW_STATE_STORAGE_KEY = "v2-desktop-window-state";

type StorageArea = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function loadWindowState<T>(
  tabStorage: StorageArea,
  deserialize: (serializedState: string) => T | null
): T | null {
  try {
    const value = tabStorage.getItem(WINDOW_STATE_STORAGE_KEY);
    if (value === null) return null;

    const parsed = deserialize(value);
    if (parsed === null) tabStorage.removeItem(WINDOW_STATE_STORAGE_KEY);
    return parsed;
  } catch {
    return null;
  }
}

export function saveWindowStatePayload(tabStorage: StorageArea, serializedState: string): void {
  tabStorage.setItem(WINDOW_STATE_STORAGE_KEY, serializedState);
}

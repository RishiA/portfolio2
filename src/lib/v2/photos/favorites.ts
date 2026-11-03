// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
interface FavoritesStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const FAVORITES_STORAGE_KEY = "v2-photos-favorites";
const VIEW_STORAGE_KEY = "v2-photos-view";

function resolveStorage(storage?: FavoritesStorage): FavoritesStorage | null {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function loadFavorites(storage?: FavoritesStorage): Set<string> {
  try {
    const saved = resolveStorage(storage)?.getItem(FAVORITES_STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function saveFavorites(favorites: Set<string>, storage?: FavoritesStorage): void {
  try {
    resolveStorage(storage)?.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // Favorites stay in memory when browser storage is unavailable.
  }
}

/** Returns a new set with the id added or removed. */
export function toggleFavoriteId(favorites: Set<string>, photoId: string): Set<string> {
  const next = new Set(favorites);
  if (next.has(photoId)) next.delete(photoId);
  else next.add(photoId);
  return next;
}

export function loadPhotosView(storage?: FavoritesStorage): string {
  try {
    return resolveStorage(storage)?.getItem(VIEW_STORAGE_KEY) || "library";
  } catch {
    return "library";
  }
}

export function savePhotosView(view: string, storage?: FavoritesStorage): void {
  try {
    resolveStorage(storage)?.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // The view resets to Library on the next visit.
  }
}

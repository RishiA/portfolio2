// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

export const MUSIC_FAVORITES_STORAGE_KEY = "v2-music-favorite-song-ids";

export function parseFavoriteSongIds(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return [...new Set(parsed.filter((id): id is string => typeof id === "string" && id.length > 0))];
  } catch {
    return [];
  }
}

export function serializeFavoriteSongIds(ids: Iterable<string>): string {
  return JSON.stringify([...new Set(ids)]);
}

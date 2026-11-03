import { z } from "zod";
import type { Playlist, PlaylistTrack } from "./types";
import { parseAppleMusicTrackRef } from "./apple-music-url";

const ITUNES_LOOKUP_URL = "https://itunes.apple.com/lookup";
const LOOKUP_BATCH_SIZE = 100;

const lookupResultSchema = z.object({
  trackId: z.number(),
  trackName: z.string().optional(),
  artistName: z.string().optional(),
  collectionName: z.string().optional(),
  artworkUrl100: z.string().optional(),
  previewUrl: z.string().url().optional(),
  trackTimeMillis: z.number().optional()
});

const lookupResponseSchema = z.object({
  results: z.array(z.unknown())
});

export type ItunesSong = z.infer<typeof lookupResultSchema>;

/** A track as entered in Sanity: the link plus optional text overrides. */
export interface TrackEntry {
  appleMusicUrl: string;
  title?: string | null;
  artist?: string | null;
}

export interface PlaylistEntry {
  id: string;
  name: string;
  emoji?: string | null;
  description?: string | null;
  tracks: TrackEntry[];
}

/** Apple serves cover art at a size named in the file name. Ask for 600x600 instead of the 100x100 default. */
export function upscaleArtwork(url: string, size = 600): string {
  return url.replace(/\/\d+x\d+(bb)?(-\d+)?\.(jpg|png|webp)$/i, `/${size}x${size}bb.$3`);
}

/** Keeps the rows that are songs and drops anything malformed. */
export function parseLookupResponse(json: unknown): ItunesSong[] {
  const envelope = lookupResponseSchema.safeParse(json);
  if (!envelope.success) return [];

  const songs: ItunesSong[] = [];
  for (const row of envelope.data.results) {
    const parsed = lookupResultSchema.safeParse(row);
    if (parsed.success) songs.push(parsed.data);
  }
  return songs;
}

export function mapSongToTrack(song: ItunesSong, entry?: TrackEntry): PlaylistTrack {
  return {
    id: String(song.trackId),
    name: entry?.title?.trim() || song.trackName || "Untitled",
    artist: entry?.artist?.trim() || song.artistName || "Unknown Artist",
    album: song.collectionName ?? "Single",
    albumArt: song.artworkUrl100 ? upscaleArtwork(song.artworkUrl100) : "",
    previewUrl: song.previewUrl ?? null,
    duration: Math.round((song.trackTimeMillis ?? 0) / 1000)
  };
}

/** Looks up songs by track id for one storefront, in batches. Failed batches yield no songs. */
export async function lookupSongs(
  trackIds: string[],
  storefront: string,
  fetchImpl: typeof fetch = fetch
): Promise<Map<string, ItunesSong>> {
  const found = new Map<string, ItunesSong>();

  for (let start = 0; start < trackIds.length; start += LOOKUP_BATCH_SIZE) {
    const batch = trackIds.slice(start, start + LOOKUP_BATCH_SIZE);
    const url = `${ITUNES_LOOKUP_URL}?id=${batch.join(",")}&entity=song&country=${storefront}`;
    try {
      const response = await fetchImpl(url, { next: { revalidate: 86400 } });
      if (!response.ok) continue;
      for (const song of parseLookupResponse(await response.json())) {
        found.set(String(song.trackId), song);
      }
    } catch {
      continue;
    }
  }

  return found;
}

/**
 * Turns Sanity playlists into the shape the Music app reads.
 *
 * A song the lookup could not find stays in the playlist only when the editor gave it a title,
 * and then has no cover and no preview. Otherwise it is left out.
 */
export async function resolvePlaylists(
  entries: PlaylistEntry[],
  fetchImpl: typeof fetch = fetch
): Promise<Playlist[]> {
  const idsByStorefront = new Map<string, Set<string>>();
  for (const entry of entries) {
    for (const track of entry.tracks) {
      const ref = parseAppleMusicTrackRef(track.appleMusicUrl);
      if (!ref) continue;
      const ids = idsByStorefront.get(ref.storefront) ?? new Set<string>();
      ids.add(ref.trackId);
      idsByStorefront.set(ref.storefront, ids);
    }
  }

  const songsByStorefront = new Map<string, Map<string, ItunesSong>>();
  await Promise.all(
    Array.from(idsByStorefront, async ([storefront, ids]) => {
      songsByStorefront.set(storefront, await lookupSongs(Array.from(ids), storefront, fetchImpl));
    })
  );

  return entries.map((entry) => {
    const seen = new Set<string>();
    const tracks: PlaylistTrack[] = [];

    for (const trackEntry of entry.tracks) {
      const ref = parseAppleMusicTrackRef(trackEntry.appleMusicUrl);
      if (!ref || seen.has(ref.trackId)) continue;
      seen.add(ref.trackId);

      const song = songsByStorefront.get(ref.storefront)?.get(ref.trackId);
      if (song) {
        tracks.push(mapSongToTrack(song, trackEntry));
      } else if (trackEntry.title?.trim()) {
        tracks.push({
          id: ref.trackId,
          name: trackEntry.title.trim(),
          artist: trackEntry.artist?.trim() || "Unknown Artist",
          album: "Single",
          albumArt: "",
          previewUrl: null,
          duration: 0
        });
      }
    }

    return {
      id: entry.id,
      name: entry.name,
      emoji: entry.emoji ?? undefined,
      description: entry.description ?? undefined,
      coverArt: tracks.find((track) => track.albumArt)?.albumArt ?? "",
      tracks
    };
  });
}

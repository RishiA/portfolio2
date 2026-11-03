import { cache } from "react";
import { isSanityConfigured, sanityClient } from "@/lib/sanity/client";
import { mapPlaylistEntries } from "@/lib/sanity/mappers";
import { playlistsQuery } from "@/lib/sanity/queries";
import { resolvePlaylists } from "@/lib/v2/music/itunes";
import type { Playlist } from "@/lib/v2/music/types";

/** Playlists from Sanity with cover art and previews looked up from Apple. Empty when Sanity is unreachable. */
export const getPlaylists = cache(async (): Promise<Playlist[]> => {
  if (!isSanityConfigured || !sanityClient) {
    return [];
  }
  try {
    const data = await sanityClient.fetch<unknown[]>(playlistsQuery);
    const entries = mapPlaylistEntries(data ?? []);
    return await resolvePlaylists(entries);
  } catch {
    return [];
  }
});

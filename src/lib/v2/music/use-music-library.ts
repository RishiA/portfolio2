"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useEffect, useMemo, useState } from "react";
import { getAlbumsFromPlaylists, getAllSongs, getArtistsFromPlaylists } from "./library";
import type { Playlist } from "./types";

const MUSIC_API_PATH = "/api/v2/music";

export type MusicLoadStatus = "loading" | "ready" | "error";

function isPlaylistList(value: unknown): value is Playlist[] {
  return Array.isArray(value);
}

/** Loads the playlists once and derives the song, album and artist lists from them. */
export function useMusicLibrary() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [status, setStatus] = useState<MusicLoadStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch(MUSIC_API_PATH, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
      })
      .then((body: { data?: unknown }) => {
        setPlaylists(isPlaylistList(body.data) ? body.data : []);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  const songs = useMemo(() => getAllSongs(playlists), [playlists]);
  const albums = useMemo(() => getAlbumsFromPlaylists(playlists), [playlists]);
  const artists = useMemo(() => getArtistsFromPlaylists(playlists), [playlists]);

  return { playlists, songs, albums, artists, status };
}

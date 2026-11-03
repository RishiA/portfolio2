// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import type { Album, Artist, Playlist, PlaylistTrack } from "./types";

/** Every distinct song across the playlists, in first-seen order. */
export function getAllSongs(playlists: Playlist[]): PlaylistTrack[] {
  const songs = new Map<string, PlaylistTrack>();
  for (const playlist of playlists) {
    for (const track of playlist.tracks) {
      if (!songs.has(track.id)) songs.set(track.id, track);
    }
  }
  return Array.from(songs.values());
}

/** Songs grouped by album and artist. */
export function getAlbumsFromPlaylists(playlists: Playlist[]): Album[] {
  const albums = new Map<string, Album>();
  for (const track of getAllSongs(playlists)) {
    const key = `${track.album}-${track.artist}`;
    const album = albums.get(key);
    if (!album) {
      albums.set(key, {
        id: key,
        name: track.album,
        artist: track.artist,
        albumArt: track.albumArt,
        trackCount: 1,
        tracks: [track]
      });
    } else {
      album.trackCount++;
      album.tracks.push(track);
    }
  }
  return Array.from(albums.values());
}

/** Songs counted per artist. The artist picture is the first song's cover. */
export function getArtistsFromPlaylists(playlists: Playlist[]): Artist[] {
  const artists = new Map<string, Artist>();
  for (const track of getAllSongs(playlists)) {
    const artist = artists.get(track.artist);
    if (!artist) {
      artists.set(track.artist, {
        id: track.artist.toLowerCase().replace(/\s+/g, "-"),
        name: track.artist,
        image: track.albumArt,
        trackCount: 1
      });
    } else {
      artist.trackCount++;
    }
  }
  return Array.from(artists.values());
}

/** The label shown for a playlist in the sidebar and headings. */
export function playlistLabel(playlist: Pick<Playlist, "name" | "emoji">): string {
  return playlist.emoji ? `${playlist.emoji} ${playlist.name}` : playlist.name;
}

/** Id of the built-in playlist made from the songs a visitor has favorited. */
export const FAVORITES_PLAYLIST_ID = "favorite-songs";

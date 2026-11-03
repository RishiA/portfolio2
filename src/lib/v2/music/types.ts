// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

export interface PlaylistTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  /** Length in seconds. */
  duration: number;
}

export interface Playlist {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  coverArt: string;
  tracks: PlaylistTrack[];
}

export type MusicView = "home" | "artists" | "albums" | "songs" | "playlist";

export type RepeatMode = "off" | "all" | "one";

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: PlaylistTrack | null;
  queue: PlaylistTrack[];
  /** Queue in its original order, before shuffle. */
  originalQueue: PlaylistTrack[];
  queueIndex: number;
  /** 0 to 1. */
  progress: number;
  /** 0 to 1. */
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  /** Length of the loaded audio in seconds. */
  duration: number;
  error: string | null;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  trackCount: number;
  tracks: PlaylistTrack[];
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  trackCount: number;
}

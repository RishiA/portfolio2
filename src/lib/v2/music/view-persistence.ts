// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import type { MusicView } from "./types";

const MUSIC_STATE_KEY = "v2-music-view-state";
const MUSIC_SHOW_CONTENT_KEY = "v2-music-show-content";
const MUSIC_VIEWS: MusicView[] = ["home", "artists", "albums", "songs", "playlist"];

interface MusicViewState {
  view: MusicView;
  playlistId: string | null;
}

/** The last open view, kept per tab so a refresh returns to it. */
export function loadMusicState(): MusicViewState {
  const defaultState: MusicViewState = { view: "home", playlistId: null };
  if (typeof window === "undefined") return defaultState;

  try {
    const saved = window.sessionStorage.getItem(MUSIC_STATE_KEY);
    if (!saved) return defaultState;
    const parsed = JSON.parse(saved);
    return {
      view: MUSIC_VIEWS.includes(parsed.view) ? parsed.view : "home",
      playlistId: typeof parsed.playlistId === "string" ? parsed.playlistId : null
    };
  } catch {
    return defaultState;
  }
}

export function saveMusicState(view: MusicView, playlistId: string | null): void {
  try {
    window.sessionStorage.setItem(MUSIC_STATE_KEY, JSON.stringify({ view, playlistId }));
  } catch {
    // Storage can be unavailable; the view still works for this page.
  }
}

/** On a phone, whether the content pane (rather than the sidebar list) is showing. */
export function loadMusicShowContent(): boolean {
  try {
    return window.sessionStorage.getItem(MUSIC_SHOW_CONTENT_KEY) !== "false";
  } catch {
    return true;
  }
}

export function saveMusicShowContent(showContent: boolean): void {
  try {
    window.sessionStorage.setItem(MUSIC_SHOW_CONTENT_KEY, String(showContent));
  } catch {
    // Storage can be unavailable; the view still works for this page.
  }
}

"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import type { PlaylistTrack, RepeatMode, PlaybackState } from "./types";
import {
  MUSIC_RECENTLY_PLAYED_STORAGE_KEY,
  parseRecentlyPlayedTracks,
  recordRecentlyPlayedTrack,
  serializeRecentlyPlayedTracks,
} from "./recently-played";

interface AudioContextValue {
  playbackState: PlaybackState;
  recentlyPlayedTracks: PlaylistTrack[];
  play: (track: PlaylistTrack, queue: PlaylistTrack[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (progress: number) => void;
  setVolume: (volume: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

const STORAGE_KEY = "v2-music-playback-state";

function loadRecentlyPlayedTracks(): PlaylistTrack[] {
  if (typeof window === "undefined") return [];
  try {
    return parseRecentlyPlayedTracks(
      localStorage.getItem(MUSIC_RECENTLY_PLAYED_STORAGE_KEY)
    );
  } catch {
    return [];
  }
}

// Persist playback state including queue for next/previous to work after refresh
interface PersistedState {
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  currentTrack: PlaylistTrack | null;
  progress: number;
  queue: PlaylistTrack[];
  originalQueue: PlaylistTrack[];
  queueIndex: number;
}

function loadStoredState(): Partial<PlaybackState> {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: PersistedState = JSON.parse(stored);
      return {
        volume: parsed.volume ?? 0.7,
        isShuffle: parsed.isShuffle ?? false,
        repeatMode: parsed.repeatMode ?? "off",
        currentTrack: parsed.currentTrack ?? null,
        progress: parsed.progress ?? 0,
        queue: parsed.queue ?? [],
        originalQueue: parsed.originalQueue ?? [],
        queueIndex: parsed.queueIndex ?? -1,
      };
    }
  } catch {
    // Ignore
  }
  return {};
}

function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore - quota exceeded or private browsing
  }
}

function toPersisted(state: PlaybackState): PersistedState {
  return {
    volume: state.volume,
    isShuffle: state.isShuffle,
    repeatMode: state.repeatMode,
    currentTrack: state.currentTrack,
    progress: state.progress,
    queue: state.queue,
    originalQueue: state.originalQueue,
    queueIndex: state.queueIndex,
  };
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const defaultState: PlaybackState = {
  isPlaying: false,
  currentTrack: null,
  queue: [],
  originalQueue: [],
  queueIndex: -1,
  progress: 0,
  volume: 0.7,
  isShuffle: false,
  repeatMode: "off",
  duration: 0,
  error: null,
};

/**
 * Owns the one Audio element. Mount it above the windows so playback keeps going
 * when the Music window is closed, minimized or unfocused. The element is created
 * on first use, or at mount when a track is being restored from the session.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(() => ({
    ...defaultState,
    ...loadStoredState(),
  }));
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState(
    loadRecentlyPlayedTracks
  );

  // Keep a ref to the latest state for callbacks that need fresh values
  const stateRef = useRef(playbackState);
  stateRef.current = playbackState;
  const playbackTrackRef = useRef(playbackState.currentTrack);

  const recordRecentlyPlayed = useCallback((track: PlaylistTrack | null) => {
    if (!track) return;

    setRecentlyPlayedTracks((current) => {
      const next = recordRecentlyPlayedTrack(current, track);
      try {
        localStorage.setItem(
          MUSIC_RECENTLY_PLAYED_STORAGE_KEY,
          serializeRecentlyPlayedTracks(next)
        );
      } catch {
        // Keep listening history available for this render when storage is unavailable.
      }
      return next;
    });
  }, []);

  // Debounced save - only saves after 1 second of no changes
  const debouncedSave = useCallback((state: PlaybackState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveState(toPersisted(state));
    }, 1000);
  }, []);

  // Immediate save for important changes (track change, settings)
  const immediateSave = useCallback((state: PlaybackState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveState(toPersisted(state));
  }, []);

  // Create the audio element the first time something needs it
  const ensureAudio = useCallback((): HTMLAudioElement | null => {
    if (audioRef.current) return audioRef.current;
    if (typeof window === "undefined") return null;

    const audio = new Audio();
    const initialState = stateRef.current;
    audio.volume = initialState.volume;

    audio.addEventListener("loadedmetadata", () => {
      if (!audio.duration || !isFinite(audio.duration)) return;
      if (pendingSeekRef.current !== null) {
        audio.currentTime = pendingSeekRef.current * audio.duration;
        pendingSeekRef.current = null;
      }
      setPlaybackState((prev) => ({ ...prev, duration: audio.duration }));
    });

    audio.addEventListener("error", () => {
      const errorMessage = audio.error?.message || "Failed to load audio";
      console.error("Audio error:", errorMessage);
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: false,
        error: errorMessage,
      }));
    });

    audio.addEventListener("playing", () => {
      recordRecentlyPlayed(playbackTrackRef.current);
    });

    audio.addEventListener("ended", () => {
      const { repeatMode, queue, queueIndex } = stateRef.current;

      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const nextIndex = queueIndex + 1;
      if (nextIndex < queue.length) {
        const nextTrack = queue[nextIndex];
        if (nextTrack.previewUrl) {
          playbackTrackRef.current = nextTrack;
          audio.src = nextTrack.previewUrl;
          audio.play().catch(() => {});
          setPlaybackState((prev) => ({
            ...prev,
            currentTrack: nextTrack,
            queueIndex: nextIndex,
            progress: 0,
            error: null,
          }));
        } else {
          setPlaybackState((prev) => ({
            ...prev,
            queueIndex: nextIndex,
          }));
        }
      } else if (repeatMode === "all" && queue.length > 0) {
        const firstTrack = queue[0];
        if (firstTrack.previewUrl) {
          playbackTrackRef.current = firstTrack;
          audio.src = firstTrack.previewUrl;
          audio.play().catch(() => {});
          setPlaybackState((prev) => ({
            ...prev,
            currentTrack: firstTrack,
            queueIndex: 0,
            progress: 0,
            error: null,
          }));
        }
      } else {
        setPlaybackState((prev) => ({
          ...prev,
          isPlaying: false,
          progress: 0,
        }));
      }
    });

    // Restore the persisted track (without auto-play) at its saved position
    if (initialState.currentTrack?.previewUrl) {
      pendingSeekRef.current = initialState.progress > 0 ? initialState.progress : null;
      audio.src = initialState.currentTrack.previewUrl;
    }

    audioRef.current = audio;
    return audio;
  }, [recordRecentlyPlayed]);

  // A track restored from the session needs its element so the bar shows the right length
  useEffect(() => {
    if (stateRef.current.currentTrack?.previewUrl) {
      ensureAudio();
    }
  }, [ensureAudio]);

  // Stop playback and drop the element when the provider unmounts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = playbackState.volume;
    }
  }, [playbackState.volume]);

  // Debounced save for progress updates
  useEffect(() => {
    debouncedSave(stateRef.current);
  }, [playbackState.progress, debouncedSave]);

  // Immediate save for important state changes
  const prevTrackRef = useRef(playbackState.currentTrack?.id);
  const prevVolumeRef = useRef(playbackState.volume);
  const prevShuffleRef = useRef(playbackState.isShuffle);
  const prevRepeatRef = useRef(playbackState.repeatMode);
  const prevQueueRef = useRef(playbackState.queue);

  useEffect(() => {
    const trackChanged = prevTrackRef.current !== playbackState.currentTrack?.id;
    const volumeChanged = prevVolumeRef.current !== playbackState.volume;
    const shuffleChanged = prevShuffleRef.current !== playbackState.isShuffle;
    const repeatChanged = prevRepeatRef.current !== playbackState.repeatMode;
    const queueChanged = prevQueueRef.current !== playbackState.queue;

    if (trackChanged || volumeChanged || shuffleChanged || repeatChanged || queueChanged) {
      immediateSave(stateRef.current);
      prevTrackRef.current = playbackState.currentTrack?.id;
      prevVolumeRef.current = playbackState.volume;
      prevShuffleRef.current = playbackState.isShuffle;
      prevRepeatRef.current = playbackState.repeatMode;
      prevQueueRef.current = playbackState.queue;
    }
  }, [
    playbackState.currentTrack?.id,
    playbackState.volume,
    playbackState.isShuffle,
    playbackState.repeatMode,
    playbackState.queue,
    immediateSave,
  ]);

  // Progress update interval
  useEffect(() => {
    if (!playbackState.isPlaying || !audioRef.current) return;

    const interval = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        const progress =
          audioRef.current.duration > 0
            ? audioRef.current.currentTime / audioRef.current.duration
            : 0;
        setPlaybackState((prev) => ({ ...prev, progress }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [playbackState.isPlaying]);

  // Play a track
  const play = useCallback((track: PlaylistTrack, tracks: PlaylistTrack[]) => {
    const audio = ensureAudio();
    if (!audio) return;

    if (!track.previewUrl) {
      console.warn("No preview URL for track:", track.name);
      return;
    }

    pendingSeekRef.current = null;
    playbackTrackRef.current = track;
    audio.src = track.previewUrl;
    audio.play().catch(console.error);

    setPlaybackState((prev) => {
      // If shuffle is on, create shuffled queue with selected track first
      let queue: PlaylistTrack[];
      let queueIndex: number;

      if (prev.isShuffle) {
        const otherTracks = tracks.filter((t) => t.id !== track.id);
        queue = [track, ...shuffleArray(otherTracks)];
        queueIndex = 0;
      } else {
        queue = tracks;
        queueIndex = tracks.findIndex((t) => t.id === track.id);
        if (queueIndex < 0) queueIndex = 0;
      }

      return {
        ...prev,
        isPlaying: true,
        currentTrack: track,
        queue,
        originalQueue: tracks,
        queueIndex,
        progress: 0,
        error: null,
      };
    });
  }, [ensureAudio]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const resume = useCallback(() => {
    const audio = ensureAudio();
    if (audio && stateRef.current.currentTrack) {
      audio.play().catch(console.error);
      setPlaybackState((prev) => ({ ...prev, isPlaying: true, error: null }));
    }
  }, [ensureAudio]);

  const next = useCallback(() => {
    const { queue, queueIndex, repeatMode, isPlaying } = stateRef.current;
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    const audio = ensureAudio();
    if (nextTrack && nextTrack.previewUrl && audio) {
      pendingSeekRef.current = null;
      playbackTrackRef.current = nextTrack;
      audio.src = nextTrack.previewUrl;
      // Only auto-play if we were already playing
      if (isPlaying) {
        audio.play().catch(console.error);
      }
      setPlaybackState((prev) => ({
        ...prev,
        currentTrack: nextTrack,
        queueIndex: nextIndex,
        progress: 0,
        error: null,
      }));
    }
  }, [ensureAudio]);

  const previous = useCallback(() => {
    const { queue, queueIndex, isPlaying } = stateRef.current;
    const audio = ensureAudio();
    if (!audio || queue.length === 0) return;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setPlaybackState((prev) => ({ ...prev, progress: 0 }));
      return;
    }

    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      const prevTrack = queue[prevIndex];
      if (prevTrack && prevTrack.previewUrl) {
        pendingSeekRef.current = null;
        playbackTrackRef.current = prevTrack;
        audio.src = prevTrack.previewUrl;
        // Only auto-play if we were already playing
        if (isPlaying) {
          audio.play().catch(console.error);
        }
        setPlaybackState((prev) => ({
          ...prev,
          currentTrack: prevTrack,
          queueIndex: prevIndex,
          progress: 0,
          error: null,
        }));
      }
    }
  }, [ensureAudio]);

  const seek = useCallback((progress: number) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = progress * audio.duration;
      setPlaybackState((prev) => ({ ...prev, progress }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setPlaybackState((prev) => ({ ...prev, volume: clampedVolume }));
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setPlaybackState((prev) => {
      const lastIndex = prev.queue.length - 1;
      const isFutureTrack = (index: number) =>
        index > prev.queueIndex && index <= lastIndex;

      if (
        fromIndex === toIndex ||
        !isFutureTrack(fromIndex) ||
        !isFutureTrack(toIndex)
      ) {
        return prev;
      }

      const queue = [...prev.queue];
      const [track] = queue.splice(fromIndex, 1);
      queue.splice(toIndex, 0, track);

      return { ...prev, queue };
    });
  }, []);

  // Toggle shuffle mode
  const toggleShuffle = useCallback(() => {
    setPlaybackState((prev) => {
      const newIsShuffle = !prev.isShuffle;
      const currentTrack = prev.currentTrack;

      // If we have an active queue, reshuffle or restore it
      if (prev.originalQueue.length > 0 && currentTrack) {
        let newQueue: PlaylistTrack[];
        let newQueueIndex: number;

        if (newIsShuffle) {
          // Turning shuffle ON: shuffle remaining tracks, keep current at front
          const otherTracks = prev.originalQueue.filter((t) => t.id !== currentTrack.id);
          newQueue = [currentTrack, ...shuffleArray(otherTracks)];
          newQueueIndex = 0;
        } else {
          // Turning shuffle OFF: restore original order
          newQueue = prev.originalQueue;
          newQueueIndex = prev.originalQueue.findIndex((t) => t.id === currentTrack.id);
          if (newQueueIndex < 0) newQueueIndex = 0;
        }

        return {
          ...prev,
          isShuffle: newIsShuffle,
          queue: newQueue,
          queueIndex: newQueueIndex,
        };
      }

      return { ...prev, isShuffle: newIsShuffle };
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setPlaybackState((prev) => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      const currentIndex = modes.indexOf(prev.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      return { ...prev, repeatMode: nextMode };
    });
  }, []);

  return (
    <AudioContext.Provider
      value={{
        playbackState,
        recentlyPlayedTracks,
        play,
        pause,
        resume,
        next,
        previous,
        seek,
        setVolume,
        reorderQueue,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

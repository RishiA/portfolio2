"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NoteDetail, NoteListItem } from "@/lib/profile/types";
import { useShellBoot } from "@/lib/v2/shell-boot-context";
import { setUrl } from "@/lib/v2/set-url";
import { getNotesRoute, SHELL_NOTES_ROOT_PATH } from "@/lib/v2/shell-routing";
import { useWindowFocus } from "@/lib/v2/window-focus-context";
import {
  fetchNoteDetail,
  fetchNoteList,
  getCachedDetail,
  getCachedList,
  getLastSelectedSlug,
  rememberSelectedSlug,
  seedNotesCache
} from "@/lib/v2/notes/client";

const DEFAULT_NOTE_SLUG = "about-me";

function isNotesPath(pathname: string): boolean {
  return pathname === SHELL_NOTES_ROOT_PATH || pathname.startsWith(`${SHELL_NOTES_ROOT_PATH}/`);
}

/**
 * Notes data and selection. The list and the first note come from the server through ShellBoot; anything else is
 * fetched from /api/v2/notes. On desktop a note is always selected. On phones nothing is selected until a row is tapped.
 */
export function useNotes(isMobile: boolean) {
  const boot = useShellBoot();
  const windowFocus = useWindowFocus();
  const isFocused = windowFocus?.isFocused ?? true;

  const [notes, setNotes] = useState<NoteListItem[] | null>(() => {
    seedNotesCache(boot.initialNotes, boot.initialNote);
    return getCachedList();
  });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    if (isMobile) return boot.initialNoteSlug ?? null;
    return getLastSelectedSlug() ?? boot.initialNoteSlug ?? DEFAULT_NOTE_SLUG;
  });
  const [detail, setDetail] = useState<NoteDetail | null>(() => (selectedSlug ? getCachedDetail(selectedSlug) : null));
  const [failed, setFailed] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    if (notes) return;
    let cancelled = false;
    void fetchNoteList().then((list) => {
      if (!cancelled && list) setNotes(list);
    });
    return () => {
      cancelled = true;
    };
  }, [notes]);

  // A slug that is not in the list falls back to the first note on desktop and to the list on phones.
  useEffect(() => {
    if (!notes || !selectedSlug || notes.some((note) => note.slug === selectedSlug)) return;
    setSelectedSlug(isMobile ? null : (notes.find((note) => note.slug === DEFAULT_NOTE_SLUG) ?? notes[0])?.slug ?? null);
  }, [notes, selectedSlug, isMobile]);

  useEffect(() => {
    if (!selectedSlug) {
      setDetail(null);
      setFailed(false);
      return;
    }
    rememberSelectedSlug(selectedSlug);
    const cached = getCachedDetail(selectedSlug);
    if (cached) {
      setDetail(cached);
      setFailed(false);
      return;
    }
    setDetail(null);
    setFailed(false);
    const request = ++requestRef.current;
    void fetchNoteDetail(selectedSlug).then((result) => {
      if (request !== requestRef.current) return;
      setDetail(result);
      setFailed(result === null);
    });
  }, [selectedSlug]);

  // Keep the address bar on the selected note. The Desktop effect that follows window focus runs first, so wait a tick.
  useEffect(() => {
    if (!selectedSlug) return;
    const timer = window.setTimeout(() => {
      const route = getNotesRoute(selectedSlug);
      if ((isFocused || isNotesPath(window.location.pathname)) && window.location.pathname !== route) {
        setUrl(route);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedSlug, isFocused]);

  const select = useCallback((slug: string) => setSelectedSlug(slug), []);

  const back = useCallback(() => {
    setSelectedSlug(null);
    setUrl(SHELL_NOTES_ROOT_PATH);
  }, []);

  const selectedItem = notes?.find((note) => note.slug === selectedSlug) ?? null;

  return { notes, selectedSlug, selectedItem, detail, failed, select, back };
}

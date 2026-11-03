"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NoteKind, NoteListItem } from "@/lib/profile/types";
import { COLLECTIONS, filterByCollection, isCollectionId, searchNotes, type CollectionId } from "@/lib/v2/note-filter";
import { formatNoteDate, groupNotes } from "@/lib/v2/note-groups";
import { listKeyAction, nextRowIndex } from "./keyboard";

const COLLECTION_KEY = "v2-notes-collection";
const SCROLL_KEY = "v2-notes-scroll";
const NOTES_PREFIX = "/v2/notes/";

const FALLBACK_EMOJI: Record<NoteKind, string> = {
  about: "\u{1F44B}",
  landing: "\u{1F4C4}",
  work: "\u{1F4BC}",
  project: "\u{1F9EA}",
  note: "\u{1F4DD}",
  post: "\u{270D}\u{FE0F}"
};

function readStorage(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage can be blocked. The list still works without it.
  }
}

function slugFromPath(pathname: string): string | null {
  if (!pathname.startsWith(NOTES_PREFIX)) return null;
  const slug = pathname.slice(NOTES_PREFIX.length).split("/")[0];
  try {
    return slug ? decodeURIComponent(slug) : null;
  } catch {
    return slug || null;
  }
}

interface NotesSidebarProps {
  items: NoteListItem[];
  /** Server render time. Used for the first render so the server and client markup match. */
  nowIso: string;
}

export function NotesSidebar({ items, nowIso }: NotesSidebarProps) {
  const pathname = usePathname() ?? "";
  const selectedSlug = slugFromPath(pathname);
  const [collection, setCollection] = useState<CollectionId>("all");
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => new Date(nowIso));
  const paneRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNow(new Date());
    const saved = readStorage(COLLECTION_KEY);
    if (isCollectionId(saved)) setCollection(saved);
  }, []);

  // The list is hidden on small screens while a note is open, which resets its scroll position.
  // Restore it whenever the list is showing again.
  const listVisible = selectedSlug === null;
  useEffect(() => {
    const saved = Number(readStorage(SCROLL_KEY));
    if (scrollRef.current && Number.isFinite(saved) && saved > 0) scrollRef.current.scrollTop = saved;
  }, [listVisible, collection]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as Node | null;
      const action = listKeyAction(event, {
        inList: Boolean(target && paneRef.current?.contains(target)),
        inReader: target instanceof Element && target.closest("[data-v2-reader]") !== null
      });
      if (!action) return;
      if (action === "search") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      const rows = Array.from(paneRef.current?.querySelectorAll<HTMLElement>("[data-note-row]") ?? []);
      if (rows.length === 0) return;
      event.preventDefault();
      const focused = rows.indexOf(document.activeElement as HTMLElement);
      const current = focused >= 0 ? focused : rows.findIndex((row) => row.dataset.noteSlug === selectedSlug);
      rows[nextRowIndex(action, current, rows.length)].focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedSlug]);

  const searching = query.trim().length > 0;
  const visible = useMemo(
    () => (searching ? searchNotes(items, query) : filterByCollection(items, collection)),
    [items, query, collection, searching]
  );
  const groups = useMemo(
    () => (searching ? [{ id: "results", label: "Results", items: visible }] : groupNotes(visible, now)),
    [searching, visible, now]
  );

  const chooseCollection = (id: CollectionId) => {
    setCollection(id);
    setQuery("");
    writeStorage(COLLECTION_KEY, id);
    writeStorage(SCROLL_KEY, "0");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const Heading = selectedSlug ? "h2" : "h1";
  const status = searching
    ? `${visible.length} ${visible.length === 1 ? "result" : "results"}`
    : `${visible.length} ${visible.length === 1 ? "note" : "notes"}`;

  return (
    <div className="v2-sidebar" ref={paneRef}>
      <nav className="v2-collections" aria-label="Collections">
        <ul>
          {COLLECTIONS.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                className="v2-collection"
                aria-pressed={!searching && collection === id}
                onClick={() => chooseCollection(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="v2-list-pane">
        <Heading className="v2-sr">Notes</Heading>
        <form className="v2-search" action="/v2/search" method="get" role="search">
          <label className="v2-sr" htmlFor="v2-search-input">
            Search notes
          </label>
          <input
            id="v2-search-input"
            ref={searchRef}
            name="q"
            type="search"
            placeholder="Search"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              if (query) setQuery("");
              else event.currentTarget.blur();
            }}
          />
        </form>
        <p className="v2-sr" role="status" aria-live="polite">
          {status}
        </p>

        <div
          className="v2-list-scroll"
          ref={scrollRef}
          onScroll={(event) => writeStorage(SCROLL_KEY, String(event.currentTarget.scrollTop))}
        >
          {visible.length === 0 ? (
            <p className="v2-empty-list">{searching ? "No notes match your search." : "Nothing here yet."}</p>
          ) : (
            groups.map((group) => (
              <section key={group.id} className="v2-group" aria-labelledby={`v2-group-${group.id}`}>
                <h3 id={`v2-group-${group.id}`} className="v2-group-title">
                  {group.label}
                </h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={item.url}
                        className="v2-row"
                        data-note-row=""
                        data-note-slug={item.slug}
                        aria-current={item.slug === selectedSlug ? "page" : undefined}
                      >
                        <span className="v2-row-emoji" aria-hidden="true">
                          {item.emoji ?? FALLBACK_EMOJI[item.kind]}
                        </span>
                        <span className="v2-row-text">
                          <span className="v2-row-title">{item.title}</span>
                          <span className="v2-row-meta">
                            {item.date ? <span className="v2-row-date">{formatNoteDate(item.date)}</span> : null}
                            <span className="v2-row-excerpt">{item.excerpt}</span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

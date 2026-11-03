"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NoteListItem } from "@/lib/profile/types";
import { flattenGroups, groupNotes } from "@/lib/v2/notes/groups";
import { searchNotes } from "@/lib/v2/notes/search";
import { useWindowFocus } from "@/lib/v2/window-focus-context";
import { cn } from "@/lib/v2/utils";
import { Nav } from "./nav";
import { NoteItem } from "./note-item";
import { ScrollArea } from "./scroll-area";
import { SearchBar } from "./search-bar";

interface SidebarProps {
  notes: NoteListItem[];
  selectedSlug: string | null;
  isMobile: boolean;
  onSelect: (slug: string) => void;
}

export function Sidebar({ notes, selectedSlug, isMobile, onSelect }: SidebarProps) {
  const [now] = useState(() => new Date());
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const windowFocus = useWindowFocus();

  const groups = useMemo(() => groupNotes(notes, now), [notes, now]);
  const orderedNotes = useMemo(() => flattenGroups(groups), [groups]);
  const searchResults = useMemo(() => (searchQuery.trim() ? searchNotes(notes, searchQuery) : null), [notes, searchQuery]);

  const scrollToNote = useCallback((slug: string) => {
    scrollContentRef.current
      ?.querySelector(`[data-note-slug="${CSS.escape(slug)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  useEffect(() => {
    if (selectedSlug) scrollToNote(selectedSlug);
  }, [selectedSlug, scrollToNote]);

  useEffect(() => {
    if (!searchResults || !selectedSlug) return;
    const index = searchResults.findIndex((note) => note.slug === selectedSlug);
    if (index >= 0) setHighlightedIndex(index);
  }, [searchResults, selectedSlug]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setHighlightedIndex(0);
  }, []);

  const moveSelection = useCallback(
    (direction: "up" | "down") => {
      const currentIndex = orderedNotes.findIndex((note) => note.slug === selectedSlug);
      const nextIndex =
        direction === "up"
          ? currentIndex > 0
            ? currentIndex - 1
            : orderedNotes.length - 1
          : currentIndex < orderedNotes.length - 1
            ? currentIndex + 1
            : 0;
      const next = orderedNotes[nextIndex];
      if (next) onSelect(next.slug);
    },
    [orderedNotes, selectedSlug, onSelect]
  );

  const openHighlighted = useCallback(() => {
    const note = searchResults?.[highlightedIndex];
    if (note) onSelect(note.slug);
  }, [searchResults, highlightedIndex, onSelect]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (windowFocus) {
        if (!windowFocus.isFocused) return;
      } else if (!target.closest?.('[data-app="notes"]')) {
        return;
      }

      const results = searchResults && searchResults.length > 0 ? searchResults : null;
      const moveHighlight = (direction: 1 | -1) =>
        results && setHighlightedIndex((index) => (index + direction + results.length) % results.length);

      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (isTyping) {
        if (target === searchInputRef.current && results && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
          event.preventDefault();
          moveHighlight(event.key === "ArrowDown" ? 1 : -1);
        } else if (event.key === "Escape") {
          (document.activeElement as HTMLElement)?.blur();
        } else if (event.key === "Enter" && results) {
          event.preventDefault();
          openHighlighted();
        }
        return;
      }

      if (event.metaKey || event.ctrlKey) return;

      const isDown = event.key === "j" || event.key === "ArrowDown";
      const isUp = event.key === "k" || event.key === "ArrowUp";
      if (isDown || isUp) {
        event.preventDefault();
        (document.activeElement as HTMLElement)?.blur();
        if (searchResults) {
          moveHighlight(isDown ? 1 : -1);
        } else {
          moveSelection(isDown ? "down" : "up");
        }
      } else if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
      } else if (event.key === "Enter" && results) {
        event.preventDefault();
        openHighlighted();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchResults, windowFocus, moveSelection, openHighlighted]);

  useEffect(() => {
    if (searchResults?.[highlightedIndex]) scrollToNote(searchResults[highlightedIndex].slug);
  }, [searchResults, highlightedIndex, scrollToNote]);

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        isMobile ? "w-full max-w-full bg-[#F2F2F7] dark:bg-black" : "w-[320px] border-r border-muted-foreground/20 bg-muted"
      )}
    >
      <Nav isMobile={isMobile} isScrolled={isScrolled} />
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <ScrollArea
          className="h-full"
          isMobile={isMobile}
          onScrollCapture={(event: React.UIEvent<HTMLDivElement>) => {
            const viewport = event.currentTarget.querySelector("[data-radix-scroll-area-viewport]");
            if (viewport) setIsScrolled(viewport.scrollTop > 0);
          }}
        >
          <div ref={scrollContentRef} className="flex w-full flex-col">
            <div className={cn("w-full px-2", !isMobile && "w-[320px]")}>
              <SearchBar
                inputRef={searchInputRef}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setHighlightedIndex={setHighlightedIndex}
                clearSearch={clearSearch}
              />
              <div className="py-2">
                {searchResults === null ? (
                  <nav aria-label="Notes list">
                    {groups.map((group) => (
                      <section key={group.id}>
                        <h3 className="ml-2 py-1 text-xs font-bold text-muted-foreground">{group.label}</h3>
                        <ul>
                          {group.items.map((item, index) => (
                            <NoteItem
                              key={item.slug}
                              item={item}
                              selectedSlug={selectedSlug}
                              isMobile={isMobile}
                              isHighlighted={false}
                              isSearching={false}
                              showDivider={index < group.items.length - 1}
                              onSelect={onSelect}
                            />
                          ))}
                        </ul>
                      </section>
                    ))}
                  </nav>
                ) : searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((item, index) => (
                      <NoteItem
                        key={item.slug}
                        item={item}
                        selectedSlug={selectedSlug}
                        isMobile={isMobile}
                        isHighlighted={index === highlightedIndex}
                        isSearching
                        showDivider={index < searchResults.length - 1}
                        searchQuery={searchQuery}
                        onSelect={onSelect}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 px-2 text-sm text-muted-foreground">No results found</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

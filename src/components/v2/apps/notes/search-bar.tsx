"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useEffect, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Search, X } from "lucide-react";
import { useWindowFocus } from "@/lib/v2/window-focus-context";

interface SearchBarProps {
  inputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setHighlightedIndex: Dispatch<SetStateAction<number>>;
  clearSearch: () => void;
}

export function SearchBar({ inputRef, searchQuery, setSearchQuery, setHighlightedIndex, clearSearch }: SearchBarProps) {
  const windowFocus = useWindowFocus();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (windowFocus) {
        if (!windowFocus.isFocused) return;
      } else {
        const target = e.target as HTMLElement;
        if (!target.closest?.('[data-app="notes"]')) return;
      }

      // A second Escape press clears the search.
      if (e.key === "Escape" && document.activeElement !== inputRef.current && searchQuery) {
        clearSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [inputRef, searchQuery, clearSearch, windowFocus]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      clearSearch();
      return;
    }
    setHighlightedIndex(0);
  };

  return (
    <div className="p-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="text-muted-foreground" size={14} aria-hidden />
        </div>
        <input
          id="v2-notes-search"
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search"
          className="w-full pl-8 pr-8 py-0.5 rounded-lg text-base desktop:text-sm placeholder:text-sm focus:outline-none border border-muted-foreground/20 dark:border-none dark:bg-[#353533]"
          aria-label="Search notes"
          autoComplete="off"
          ref={inputRef}
        />
        {searchQuery && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              clearSearch();
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground can-hover:hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

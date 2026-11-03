"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/v2/utils";
import { useWindowFocus } from "@/lib/v2/window-focus-context";
import type { SettingsCategory } from "@/lib/v2/settings/navigation";
import {
  SETTINGS_CATEGORY_LABELS,
  getNextSettingsSearchResultIndex,
  searchSettings,
  type SettingsSearchItem
} from "@/lib/v2/settings/search-items";
import { CATEGORIES } from "./categories";
import { SidebarNav } from "./sidebar-nav";

interface SidebarProps {
  selectedCategory: SettingsCategory;
  onCategorySelect: (category: SettingsCategory) => void;
  onSearchResultSelect: (item: SettingsSearchItem) => void;
  isDesktop?: boolean;
}

export function Sidebar({ selectedCategory, onCategorySelect, onSearchResultSelect, isDesktop = false }: SidebarProps) {
  const windowFocus = useWindowFocus();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedSearchIndex, setHighlightedSearchIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchResults = searchSettings(searchQuery);

  const chooseResult = (item: SettingsSearchItem) => {
    onSearchResultSelect(item);
    setSearchQuery("");
    setHighlightedSearchIndex(0);
    searchInputRef.current?.blur();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (windowFocus && !windowFocus.isFocused) return;

      const target = event.target as HTMLElement | null;
      const isTypingTarget = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      const isSearchFocused = document.activeElement === searchInputRef.current;

      if (event.key === "Escape" && (isSearchFocused || searchQuery)) {
        event.preventDefault();
        if (isSearchFocused) {
          searchInputRef.current?.blur();
        } else {
          setSearchQuery("");
          setHighlightedSearchIndex(0);
        }
        return;
      }

      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingTarget) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (!searchQuery || searchResults.length === 0) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction: 1 | -1 = event.key === "ArrowDown" ? 1 : -1;
        setHighlightedSearchIndex((index) => getNextSettingsSearchResultIndex(index, searchResults.length, direction));
        return;
      }

      if (event.key === "Enter") {
        const item = searchResults[highlightedSearchIndex];
        if (!item) return;
        event.preventDefault();
        onSearchResultSelect(item);
        setSearchQuery("");
        setHighlightedSearchIndex(0);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [highlightedSearchIndex, onSearchResultSelect, searchQuery, searchResults, windowFocus]);

  useEffect(() => {
    setHighlightedSearchIndex((index) => Math.min(index, Math.max(0, searchResults.length - 1)));
  }, [searchResults.length]);

  useEffect(() => {
    if (!searchQuery || searchResults.length === 0) return;
    searchResultsRef.current
      ?.querySelector(`[data-settings-search-result-index="${highlightedSearchIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedSearchIndex, searchQuery, searchResults.length]);

  return (
    <div className="flex h-full w-[320px] shrink-0 select-none flex-col border-r border-border/50 bg-muted">
      <SidebarNav isScrolled={isScrolled} isDesktop={isDesktop} />

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto" onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)}>
          <div className="w-[320px] px-2">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedSearchIndex(0);
                  }}
                  placeholder="Search"
                  aria-label="Search settings"
                  className="w-full rounded-lg bg-[#E8E8E7] py-0.5 pl-8 pr-8 text-sm placeholder:text-sm placeholder:text-muted-foreground focus:outline-none dark:bg-[#353533]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setSearchQuery("");
                      setHighlightedSearchIndex(0);
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 transform text-muted-foreground can-hover:hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {searchQuery ? (
              <div ref={searchResultsRef} className="space-y-0.5 py-2" data-testid="settings-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((item, index) => {
                    const isHighlighted = index === highlightedSearchIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-settings-search-result-index={index}
                        aria-current={isHighlighted ? "true" : undefined}
                        onClick={() => chooseResult(item)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left active:bg-background/70",
                          isHighlighted ? "bg-[#0A7CFF] text-white" : "can-hover:hover:bg-background/50"
                        )}
                      >
                        <span className="block text-xs font-medium">{item.label}</span>
                        <span className={cn("block text-[10px]", isHighlighted ? "text-white/80" : "text-muted-foreground")}>
                          {SETTINGS_CATEGORY_LABELS[item.category]}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-4 text-center text-xs text-muted-foreground">No settings found</p>
                )}
              </div>
            ) : (
              <>
                <div className="py-2">
                  <div className="flex w-full items-center gap-3 rounded-lg p-2" data-testid="settings-profile">
                    <Image
                      src="/images/rishi-source.jpg"
                      alt="Rishi Athanikar"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="text-xs font-medium">Rishi Athanikar</div>
                      <div className="text-[10px] text-muted-foreground">Product Manager · New York</div>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <div className="space-y-0.5">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => onCategorySelect(category.id)}
                        aria-current={selectedCategory === category.id ? "page" : undefined}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground transition-colors",
                          selectedCategory === category.id ? "bg-zinc-300 dark:bg-zinc-600" : "can-hover:hover:bg-background/50"
                        )}
                      >
                        <span className={cn("flex h-7 w-7 items-center justify-center rounded-md", category.iconBg)}>
                          {category.icon("h-5 w-5 text-white")}
                        </span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

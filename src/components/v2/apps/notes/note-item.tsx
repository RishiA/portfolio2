"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { memo } from "react";
import type { NoteListItem } from "@/lib/profile/types";
import { formatSidebarDate } from "@/lib/v2/notes/groups";
import { searchPreviewText } from "@/lib/v2/notes/search";

function HighlightedSearchPreview({ excerpt, query }: { excerpt: string; query: string }) {
  const preview = searchPreviewText(excerpt, query);
  const trimmedQuery = query.trim();
  const matchIndex = preview.toLocaleLowerCase().indexOf(trimmedQuery.toLocaleLowerCase());

  if (!trimmedQuery || matchIndex < 0) return <>{preview}</>;

  return (
    <>
      {preview.slice(0, matchIndex)}
      <strong className="font-semibold text-foreground">{preview.slice(matchIndex, matchIndex + trimmedQuery.length)}</strong>
      {preview.slice(matchIndex + trimmedQuery.length)}
    </>
  );
}

interface NoteItemProps {
  item: NoteListItem;
  selectedSlug: string | null;
  isMobile: boolean;
  isHighlighted: boolean;
  isSearching: boolean;
  showDivider: boolean;
  searchQuery?: string;
  onSelect: (slug: string) => void;
}

export const NoteItem = memo(function NoteItem({
  item,
  selectedSlug,
  isMobile,
  isHighlighted,
  isSearching,
  showDivider,
  searchQuery = "",
  onSelect
}: NoteItemProps) {
  const isActive = !isMobile && ((isSearching && isHighlighted) || (!isSearching && item.slug === selectedSlug));
  const date = item.date ? formatSidebarDate(item.date) : "";

  const row = (
    <li
      tabIndex={0}
      className={`h-[70px] w-full ${isActive ? "bg-[#FFE390] dark:bg-[#9D7D28] dark:text-white rounded-md" : ""} ${
        !isMobile && showDivider && !isActive
          ? 'after:content-[""] after:block after:mx-2 after:border-t after:border-muted-foreground/20'
          : ""
      }`}
    >
      <div data-note-slug={isMobile ? undefined : item.slug} className="h-full w-full px-4">
        <button
          type="button"
          onClick={() => onSelect(item.slug)}
          tabIndex={-1}
          className="block py-2 h-full w-full flex flex-col justify-center text-left"
        >
          <h2 className="text-sm font-bold px-2 break-words line-clamp-1">
            {item.emoji} {item.title}
          </h2>
          <p
            className={`text-xs pl-2 flex items-baseline overflow-hidden ${
              isActive ? "text-muted-foreground dark:text-white/80" : "text-muted-foreground"
            }`}
          >
            {date ? (
              <span className="text-black dark:text-white shrink-0">
                <span className="inline-block whitespace-nowrap mr-1 tabular-nums">{date}</span>
              </span>
            ) : null}
            <span className="block w-0 min-w-0 flex-1 truncate">
              {isSearching ? <HighlightedSearchPreview excerpt={item.excerpt} query={searchQuery} /> : item.excerpt}
            </span>
          </p>
        </button>
      </div>
    </li>
  );

  if (!isMobile) return row;

  return (
    <div className="relative overflow-hidden">
      <div
        data-note-slug={item.slug}
        className={`w-full ${showDivider ? 'after:content-[""] after:block after:mx-6 after:border-t after:border-muted-foreground/20' : ""}`}
      >
        {row}
      </div>
    </div>
  );
});

"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useEffect, useMemo, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, Heart, Info, Link2, Minus, Plus, Share } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/v2/utils";
import { useClickOutside } from "@/lib/v2/use-click-outside";
import { useWindowFocus } from "@/lib/v2/window-focus-context";
import {
  getPhotoGridColumnClassName,
  type PhotoGridResizeDirection,
  type PhotoGridSize
} from "@/lib/v2/photos/grid-size";
import { formatDateRange, formatPhotoDate, groupPhotosByTime } from "@/lib/v2/photos/time-groups";
import type { Album, LibraryPhoto, PhotosView, TimeFilter } from "@/lib/v2/photos/types";
import { PhotosHeader } from "./header";

// Preload viewer-size image on hover for faster viewer loading
function preloadImage(url: string) {
  if (typeof window === "undefined") return;
  const img = new window.Image();
  img.src = url;
}

interface PhotosGridProps {
  photos: LibraryPhoto[];
  loading?: boolean;
  error?: boolean;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  gridSize: PhotoGridSize;
  onGridResize: (direction: PhotoGridResizeDirection) => void;
  isMobileView: boolean;
  onBack: () => void;
  activeView: PhotosView;
  albums: Album[];
  isDesktop?: boolean;
  onToggleFavorite?: (photoId: string) => void;
  onPhotoSelect?: (photoId: string) => void;
  selectedInGridId?: string | null;
  onGridSelect?: (photoId: string | null) => void;
}

export function PhotosGrid({
  photos,
  loading = false,
  error = false,
  timeFilter,
  onTimeFilterChange,
  gridSize,
  onGridResize,
  isMobileView,
  onBack,
  activeView,
  albums,
  isDesktop = false,
  onToggleFavorite,
  onPhotoSelect,
  selectedInGridId,
  onGridSelect,
}: PhotosGridProps) {
  const windowFocus = useWindowFocus();
  const inShell = isDesktop && windowFocus;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const infoContainerRef = useRef<HTMLDivElement>(null);
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const prevPhotosRef = useRef<LibraryPhoto[] | undefined>(undefined);

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedInGridId) ?? null,
    [photos, selectedInGridId],
  );
  const selectedPhotoDate = selectedPhoto ? formatPhotoDate(selectedPhoto.takenAt) : null;
  const selectedAlbumName = albums.find((album) => album.id === selectedPhoto?.album)?.name;
  const [copied, setCopied] = useState(false);

  useClickOutside(infoContainerRef, () => setIsInfoOpen(false), isInfoOpen);
  useClickOutside(shareContainerRef, () => setIsShareOpen(false), isShareOpen);

  useEffect(() => {
    if (!selectedPhoto) setIsShareOpen(false);
  }, [selectedPhoto]);

  // Scroll to bottom only if content overflows, otherwise stay at top
  // useLayoutEffect ensures scroll happens before paint to prevent flash
  useLayoutEffect(() => {
    // Reset positioning when photos array changes (e.g., switching views)
    if (photos !== prevPhotosRef.current) {
      setIsPositioned(false);
      prevPhotosRef.current = photos;
    }

    if (photos.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      if (container.scrollHeight > container.clientHeight) {
        container.scrollTop = container.scrollHeight;
      }
      setIsPositioned(true);
    }
  }, [photos]);

  const groupedPhotos = useMemo(() => groupPhotosByTime(photos, timeFilter), [photos, timeFilter]);
  const dateRange = useMemo(() => formatDateRange(photos), [photos]);

  const getViewTitle = () => {
    if (activeView === "library") return "Library";
    if (activeView === "favorites") return "Favorites";
    const album = albums.find((a) => a.id === activeView);
    return album?.name || "Photos";
  };

  const gridSizeLabel = {
    compact: "small",
    standard: "medium",
    comfortable: "large",
  }[gridSize];

  const gridSizeControls = (
    <div
      role="group"
      aria-label="Photo thumbnail size"
      className="flex shrink-0 items-center rounded-lg bg-muted p-0.5"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        title="Zoom Out"
        aria-label={`Make thumbnails smaller. Current size: ${gridSizeLabel}`}
        disabled={gridSize === "compact"}
        onClick={() => onGridResize("smaller")}
        className="flex h-6 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors enabled:can-hover:hover:bg-background enabled:can-hover:hover:text-foreground disabled:opacity-35"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Zoom In"
        aria-label={`Make thumbnails larger. Current size: ${gridSizeLabel}`}
        disabled={gridSize === "comfortable"}
        onClick={() => onGridResize("larger")}
        className="flex h-6 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors enabled:can-hover:hover:bg-background enabled:can-hover:hover:text-foreground disabled:opacity-35"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );

  const timeFilterControls = (
    <div className="flex shrink-0 items-center gap-0.5 rounded-lg bg-muted p-0.5">
      {(["years", "months", "all"] as TimeFilter[]).map((filter) => (
        <button
          key={filter}
          type="button"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => onTimeFilterChange(filter)}
          className={cn(
            "rounded-md px-3 py-1 text-xs capitalize transition-colors",
            timeFilter === filter
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground can-hover:hover:text-foreground",
          )}
        >
          {filter === "all" ? "All Photos" : filter}
        </button>
      ))}
    </div>
  );

  const desktopActionButtonClassName =
    "rounded-md p-1 text-foreground transition-colors enabled:can-hover:hover:bg-foreground/10 disabled:cursor-default disabled:text-muted-foreground/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A7CFF]";

  const desktopPhotoActions = (
    <div
      className="ml-auto flex shrink-0 items-center gap-1"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div ref={infoContainerRef} className="relative">
        <button
          type="button"
          aria-label={isInfoOpen ? "Hide photo information" : "Show photo information"}
          aria-expanded={isInfoOpen}
          aria-controls="grid-photo-info-panel"
          onClick={() => {
            setIsInfoOpen((open) => !open);
            setIsShareOpen(false);
          }}
          className={cn(
            desktopActionButtonClassName,
            isInfoOpen && "bg-foreground/10",
          )}
        >
          <Info aria-hidden="true" className="h-5 w-5" />
        </button>

        {isInfoOpen && (
          <aside
            id="grid-photo-info-panel"
            aria-label="Photo information"
            className="absolute right-0 top-[calc(100%+12px)] z-20 w-[min(300px,calc(100vw-24px))] overflow-hidden rounded-xl border border-black/10 bg-muted/95 text-foreground shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl dark:border-white/15"
          >
            <div className="flex h-8 items-center justify-center border-b border-black/10 px-3 dark:border-white/10">
              <p className="text-xs font-medium text-muted-foreground">Info</p>
            </div>
            {selectedPhoto ? (
              <div className="space-y-3 px-3 py-3">
                <div className="min-w-0">
                  <p className="break-all text-sm font-medium leading-5">
                    {selectedPhoto.caption ?? selectedPhoto.alt}
                  </p>
                  <time
                    dateTime={selectedPhoto.takenAt}
                    className="mt-0.5 block text-xs leading-4 text-muted-foreground"
                  >
                    {selectedPhotoDate}
                  </time>
                </div>
                <dl className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-2 border-t border-black/10 pt-3 text-xs dark:border-white/10">
                  <dt className="text-muted-foreground">Favorite</dt>
                  <dd>{selectedPhoto.isFavorite ? "Yes" : "No"}</dd>
                  <dt className="text-muted-foreground">Album</dt>
                  <dd className="min-w-0 break-words">{selectedAlbumName ?? "None"}</dd>
                </dl>
              </div>
            ) : (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                Select a photo to see its information.
              </p>
            )}
          </aside>
        )}
      </div>

      <div ref={shareContainerRef} className="relative">
        <button
          type="button"
          aria-label="Share selected photo"
          aria-haspopup="menu"
          aria-expanded={isShareOpen}
          aria-controls="grid-photo-share-menu"
          disabled={!selectedPhoto}
          onClick={() => {
            setIsShareOpen((open) => !open);
            setIsInfoOpen(false);
          }}
          className={cn(
            desktopActionButtonClassName,
            isShareOpen && "bg-foreground/10",
          )}
        >
          <Share aria-hidden="true" className="h-5 w-5" />
        </button>

        {selectedPhoto && isShareOpen && (
          <div
            id="grid-photo-share-menu"
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-20 w-max min-w-44 rounded-lg border border-black/10 bg-white/95 p-1 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-800/95"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void copyPhotoLink(selectedPhoto.viewerUrl).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                });
                setIsShareOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-xs transition-colors can-hover:hover:bg-[#0A7CFF] can-hover:hover:text-white focus-visible:bg-[#0A7CFF] focus-visible:text-white focus-visible:outline-none"
            >
              <Link2 aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {copied ? "Link Copied" : "Copy Link"}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!selectedPhoto}
        onClick={() => selectedPhoto && onToggleFavorite?.(selectedPhoto.id)}
        className={desktopActionButtonClassName}
        aria-label={
          selectedPhoto?.isFavorite
            ? "Remove selected photo from favorites"
            : "Add selected photo to favorites"
        }
        title={selectedPhoto?.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      >
        <Heart
          aria-hidden="true"
          className={cn(
            "h-5 w-5",
            selectedPhoto?.isFavorite && "fill-foreground",
          )}
        />
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <PhotosHeader
        isMobileView={isMobileView}
        className={cn(isMobileView && "justify-between")}
        onMouseDown={inShell && !isMobileView ? windowFocus.onDragStart : undefined}
      >
        <div className="relative z-10 flex min-w-0 items-center gap-2">
          {isMobileView && (
            <button
              onClick={onBack}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Back to Photos albums"
              className="-ml-2 flex shrink-0 items-center text-muted-foreground"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{getViewTitle()}</h1>
            <p
              className={cn(
                "min-h-4 truncate text-xs text-muted-foreground",
                (loading || error) && "invisible",
              )}
              aria-live="polite"
            >
              {isMobileView
                ? `${photos.length} ${photos.length === 1 ? "item" : "items"}`
                : dateRange || "0 photos"}
            </p>
          </div>
        </div>

        {!isMobileView && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto relative">
                <div className="absolute right-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2">
                  {gridSizeControls}
                </div>
                {timeFilterControls}
              </div>
            </div>
            {desktopPhotoActions}
          </>
        )}
      </PhotosHeader>

      {/* Photo Grid */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "flex-1 overflow-y-auto",
          !isPositioned && photos.length > 0 && "opacity-0"
        )}
      >
        <div className="p-4" onClick={() => onGridSelect?.(null)}>
          {error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              Photos could not be loaded
            </div>
          ) : !loading && photos.length === 0 ? (
            activeView === "favorites" ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                <div className="relative mb-3 h-[94px] w-[116px]" aria-hidden="true">
                  <div className="absolute left-0 top-0 h-[76px] w-[100px] border-[4px] border-current" />
                  <div className="absolute bottom-0 right-0 h-[76px] w-[100px] border-[4px] border-current bg-background" />
                </div>
                <p className="text-sm">No photos available in album</p>
              </div>
            ) : (
              <div
                data-testid="photos-empty"
                className="flex h-64 items-center justify-center text-muted-foreground"
              >
                No photos yet
              </div>
            )
          ) : (
            groupedPhotos.map(({ key: group, photos: groupPhotos }) => (
              <div key={group} className="mb-6">
                {timeFilter !== "all" && (
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                    {group}
                  </h2>
                )}
                <div
                  data-photo-grid-size={gridSize}
                  className={cn(
                    "grid gap-2",
                    getPhotoGridColumnClassName(gridSize, isMobileView),
                  )}
                >
                  {groupPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      data-testid="photo-tile"
                      aria-label={photo.caption ?? photo.alt}
                      className={cn(
                        "aspect-square relative cursor-pointer rounded-sm",
                        !isMobileView && selectedInGridId === photo.id && "ring-[3px] ring-[#0A84FF]"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMobileView) {
                          // Mobile: single tap opens viewer
                          onPhotoSelect?.(photo.id);
                        } else {
                          // Desktop: single click selects
                          onGridSelect?.(photo.id);
                        }
                      }}
                      onDoubleClick={() => {
                        // Desktop: double click opens viewer
                        if (!isMobileView) {
                          onPhotoSelect?.(photo.id);
                        }
                      }}
                      onMouseEnter={() => {
                        if (!isMobileView) {
                          preloadImage(photo.viewerUrl);
                        }
                      }}
                    >
                      <div className="relative w-full h-full overflow-hidden bg-muted group rounded-sm pointer-events-none">
                        <Image
                          src={photo.thumbnailUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 33vw, 16vw"
                          unoptimized
                        />
                        {/* Favorite heart button */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite?.(photo.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              onToggleFavorite?.(photo.id);
                            }
                          }}
                          className={cn(
                            "absolute bottom-1 left-1 p-0.5 rounded-full transition-opacity pointer-events-auto",
                            photo.isFavorite
                              ? "opacity-100"
                              : "opacity-0 can-hover:group-hover:opacity-100"
                          )}
                        >
                          <Heart
                            className={cn(
                              "w-4 h-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                              photo.isFavorite
                                ? "fill-white text-white"
                                : "text-white"
                            )}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

async function copyPhotoLink(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Clipboard access can be blocked; the menu simply closes.
  }
}

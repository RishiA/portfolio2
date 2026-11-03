"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { V2AppProps } from "@/components/v2/apps/types";
import { loadPhotosView, savePhotosView } from "@/lib/v2/photos/favorites";
import {
  loadPhotoGridSize,
  resizePhotoGrid,
  savePhotoGridSize,
  type PhotoGridResizeDirection,
  type PhotoGridSize
} from "@/lib/v2/photos/grid-size";
import { filterPhotosForView } from "@/lib/v2/photos/time-groups";
import { PHOTO_ALBUMS, type PhotosView, type TimeFilter } from "@/lib/v2/photos/types";
import { usePhotos } from "@/lib/v2/photos/use-photos";
import { Nav } from "./nav";
import { PhotoViewer } from "./photo-viewer";
import { PhotosGrid } from "./photos-grid";
import { Sidebar } from "./sidebar";

export default function PhotosApp({ isMobile = false }: V2AppProps) {
  const isDesktop = !isMobile;
  const { photos, loading, error, toggleFavorite } = usePhotos();

  const [activeView, setActiveView] = useState<PhotosView>("library");
  const [isViewLoaded, setIsViewLoaded] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [photoGridSize, setPhotoGridSize] = useState<PhotoGridSize>("standard");
  const [isScrolled, setIsScrolled] = useState(false);
  // Phones open straight into Library; Back returns to the sidebar.
  const [showGrid, setShowGrid] = useState(true);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [selectedInGridId, setSelectedInGridId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveView(loadPhotosView());
    setPhotoGridSize(loadPhotoGridSize());
    setIsViewLoaded(true);
  }, []);

  useEffect(() => {
    if (isViewLoaded) savePhotosView(activeView);
  }, [activeView, isViewLoaded]);

  const filteredPhotos = useMemo(() => filterPhotosForView(photos, activeView), [photos, activeView]);

  const handleViewSelect = useCallback((view: PhotosView) => {
    setActiveView(view);
    setSelectedPhotoId(null);
    setSelectedInGridId(null);
    setShowGrid(true);
  }, []);

  const handleBack = useCallback(() => setShowGrid(false), []);

  const handlePhotoSelect = useCallback((photoId: string) => {
    setSelectedPhotoId(photoId);
    setSelectedInGridId(null);
    // Focus the container so keyboard navigation works immediately
    containerRef.current?.focus();
  }, []);

  const handlePhotoGridResize = useCallback((direction: PhotoGridResizeDirection) => {
    setPhotoGridSize((currentSize) => {
      const nextSize = resizePhotoGrid(currentSize, direction);
      if (nextSize !== currentSize) savePhotoGridSize(nextSize);
      return nextSize;
    });
  }, []);

  const handleCloseViewer = useCallback(() => setSelectedPhotoId(null), []);

  const selectedPhoto = selectedPhotoId ? filteredPhotos.find((photo) => photo.id === selectedPhotoId) : null;
  const selectedPhotoIndex = selectedPhoto ? filteredPhotos.findIndex((photo) => photo.id === selectedPhotoId) : -1;
  const selectedAlbumName = selectedPhoto
    ? PHOTO_ALBUMS.find((album) => album.id === selectedPhoto.album)?.name
    : undefined;

  const handlePreviousPhoto = useCallback(() => {
    setSelectedPhotoId((currentPhotoId) => {
      const currentIndex = filteredPhotos.findIndex((photo) => photo.id === currentPhotoId);
      if (currentIndex <= 0) return currentPhotoId;
      return filteredPhotos[currentIndex - 1].id;
    });
  }, [filteredPhotos]);

  const handleNextPhoto = useCallback(() => {
    setSelectedPhotoId((currentPhotoId) => {
      const currentIndex = filteredPhotos.findIndex((photo) => photo.id === currentPhotoId);
      if (currentIndex < 0 || currentIndex >= filteredPhotos.length - 1) return currentPhotoId;
      return filteredPhotos[currentIndex + 1].id;
    });
  }, [filteredPhotos]);

  // Mobile shows either the sidebar or the grid; desktop shows both.
  const showSidebar = !isMobile || !showGrid;
  const showPhotosGrid = !isMobile || showGrid;

  return (
    <div
      ref={containerRef}
      data-app="photos"
      data-testid="app-window-photos"
      tabIndex={-1}
      className="relative flex h-full overflow-hidden outline-none"
    >
      <main className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="flex min-h-0 flex-1">
          <div
            className={`h-full flex-shrink-0 overflow-hidden ${
              showSidebar ? (isMobile ? "block w-full" : "block w-[220px] border-r dark:border-foreground/20") : "hidden"
            }`}
          >
            <Sidebar
              albums={PHOTO_ALBUMS}
              activeView={activeView}
              onViewSelect={handleViewSelect}
              isMobileView={isMobile}
              onScroll={setIsScrolled}
            >
              <Nav isMobileView={isMobile} isScrolled={isScrolled} isDesktop={isDesktop} />
            </Sidebar>
          </div>

          {/* Grid stays mounted to preserve scroll position. */}
          <div className={`min-h-0 flex-1 overflow-hidden ${showPhotosGrid && !selectedPhoto ? "block" : "hidden"}`}>
            <PhotosGrid
              photos={filteredPhotos}
              loading={loading}
              error={error}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
              gridSize={photoGridSize}
              onGridResize={handlePhotoGridResize}
              isMobileView={isMobile}
              onBack={handleBack}
              activeView={activeView}
              albums={PHOTO_ALBUMS}
              isDesktop={isDesktop}
              onToggleFavorite={toggleFavorite}
              onPhotoSelect={handlePhotoSelect}
              selectedInGridId={selectedInGridId}
              onGridSelect={setSelectedInGridId}
            />
          </div>

          {selectedPhoto && showPhotosGrid && (
            <div className="min-h-0 flex-1 overflow-hidden">
              <PhotoViewer
                photo={selectedPhoto}
                photos={filteredPhotos}
                currentIndex={selectedPhotoIndex}
                albumName={selectedAlbumName}
                onBack={handleCloseViewer}
                onPrevious={handlePreviousPhoto}
                onNext={handleNextPhoto}
                onToggleFavorite={toggleFavorite}
                isMobileView={isMobile}
                isDesktop={isDesktop}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

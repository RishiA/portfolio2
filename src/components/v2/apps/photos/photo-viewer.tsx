"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useSwipeable } from "react-swipeable";
import { Camera, ChevronLeft, Heart, Info, Link2, Share } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/v2/utils";
import { useClickOutside } from "@/lib/v2/use-click-outside";
import { useWindowFocus } from "@/lib/v2/window-focus-context";
import {
  formatCameraName,
  formatDimensions,
  formatExposureCompensation,
  formatExposureTime,
  formatFileSize,
  formatLensDescription,
  formatMegapixels,
  formatPhotoType
} from "@/lib/v2/photos/photo-metadata";
import { formatPhotoDate, formatPhotoDateMobile } from "@/lib/v2/photos/time-groups";
import type { LibraryPhoto } from "@/lib/v2/photos/types";
import { PhotosHeader } from "./header";
import {
  createPhotoWheelGestureState,
  handlePhotoWheelGesture,
  PHOTO_WHEEL_GESTURE_IDLE_MS
} from "@/lib/v2/photos/wheel-navigation";
import {
  getPhotoGestureOffset,
  getPhotoSlideTransform,
  PHOTO_SLIDE_DURATION_MS,
  PHOTO_SLIDE_EASING,
  shouldCommitTouchPhotoSwipe
} from "@/lib/v2/photos/photo-transition";
import type {
  PhotoGestureSource,
  PhotoNavigationDirection,
  PhotoNavigationSource
} from "@/lib/v2/photos/photo-transition";

// Preload an image for faster navigation
function preloadImage(url: string) {
  if (typeof window === "undefined") return;
  const img = new window.Image();
  img.src = url;
}

interface PhotoViewerProps {
  photo: LibraryPhoto;
  photos: LibraryPhoto[];
  currentIndex: number;
  albumName?: string;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFavorite?: (photoId: string) => void;
  isMobileView: boolean;
  isDesktop?: boolean;
}

function PhotoSlide({ photo }: { photo: LibraryPhoto }) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={photo.viewerUrl}
        alt={photo.alt}
        fill
        draggable={false}
        className="object-contain"
        sizes="(max-width: 768px) 100vw, 80vw"
        priority
        unoptimized
      />
    </div>
  );
}

interface CameraDetailsProps {
  photo: LibraryPhoto;
  variant: "desktop" | "mobile";
}

function CameraDetails({ photo, variant }: CameraDetailsProps) {
  const isMobile = variant === "mobile";
  const details = photo.details;
  const cameraName = formatCameraName(details);
  const lensDescription = formatLensDescription(details);
  const dimensions = formatDimensions(photo.width, photo.height);
  const megapixels = formatMegapixels(photo.width, photo.height);
  const photoType = formatPhotoType(details.mimeType);
  const fileSize = details.fileSize ? formatFileSize(details.fileSize) : undefined;
  const hasExposureDetails =
    details.iso !== undefined ||
    details.focalLength35mm !== undefined ||
    details.exposureCompensation !== undefined ||
    details.fNumber !== undefined ||
    details.exposureTime !== undefined;

  return (
    <section
      aria-label="Camera details"
      aria-live="polite"
      className={cn(
        isMobile
          ? "overflow-hidden rounded-xl bg-muted/70"
          : "border-t border-black/10 px-3 py-3 dark:border-white/10"
      )}
    >
      {(
        <>
          <div
            className={cn(
              "flex items-start justify-between gap-3",
              isMobile && "px-3 py-2.5"
            )}
          >
            <div className="min-w-0">
              <p
                className={cn(
                  "font-medium leading-5",
                  isMobile ? "text-base" : "text-sm"
                )}
              >
                {cameraName ?? "Photo"}
              </p>
              {lensDescription && (
                <p
                  className={cn(
                    "text-muted-foreground",
                    isMobile ? "mt-2 text-sm leading-5" : "text-xs leading-4"
                  )}
                >
                  {lensDescription}
                </p>
              )}
              <div
                className={cn(
                  "flex flex-wrap items-center text-muted-foreground",
                  isMobile
                    ? "mt-1 gap-x-1.5 text-sm leading-5"
                    : "mt-1 gap-x-2 gap-y-1 text-xs"
                )}
              >
                {isMobile ? (
                  <>
                    {megapixels && <span>{megapixels}</span>}
                    {megapixels && dimensions && <span aria-hidden="true">•</span>}
                    {dimensions && <span>{dimensions}</span>}
                    {fileSize && (megapixels || dimensions) && <span aria-hidden="true">•</span>}
                    {fileSize && <span>{fileSize}</span>}
                  </>
                ) : (
                  <>
                    {dimensions && <span>{dimensions}</span>}
                    {megapixels && <span>{megapixels}</span>}
                    {fileSize && <span>{fileSize}</span>}
                    {photoType && (
                      <span className="rounded bg-muted-foreground/20 px-1 py-0.5 text-[10px] font-semibold leading-none text-foreground/70">
                        {photoType}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {isMobile ? (
              photoType && (
                <span className="rounded bg-muted-foreground/20 px-1.5 py-1 text-[11px] font-semibold leading-none text-foreground/70">
                  {photoType}
                </span>
              )
            ) : (
              <Camera
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              />
            )}
          </div>

          {hasExposureDetails && (
            <dl
              className={cn(
                "grid grid-cols-5 gap-1 border-t border-black/10 text-center text-muted-foreground dark:border-white/10",
                isMobile
                  ? "px-2 py-2 text-[11px] leading-4"
                  : "mt-3 pt-2 text-[10px] leading-4"
              )}
            >
              <div>
                <dt className="sr-only">ISO</dt>
                <dd>{details.iso !== undefined ? `ISO ${details.iso}` : "—"}</dd>
              </div>
              <div>
                <dt className="sr-only">Focal length</dt>
                <dd>
                  {details.focalLength35mm !== undefined
                    ? `${Math.round(details.focalLength35mm)} mm`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Exposure compensation</dt>
                <dd>
                  {details.exposureCompensation !== undefined
                    ? formatExposureCompensation(details.exposureCompensation)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Aperture</dt>
                <dd>
                  {details.fNumber !== undefined
                    ? `ƒ${details.fNumber.toFixed(1)}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="sr-only">Shutter speed</dt>
                <dd>
                  {details.exposureTime !== undefined
                    ? formatExposureTime(details.exposureTime)
                    : "—"}
                </dd>
              </div>
            </dl>
          )}
        </>
      )}
    </section>
  );
}

export function PhotoViewer({
  photo,
  photos,
  currentIndex,
  albumName,
  onBack,
  onPrevious,
  onNext,
  onToggleFavorite,
  isMobileView,
  isDesktop = false,
}: PhotoViewerProps) {
  const windowFocus = useWindowFocus();
  const inShell = isDesktop && windowFocus;
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const photoStageRef = useRef<HTMLDivElement>(null);
  const wheelIdleTimerRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const infoContainerRef = useRef<HTMLDivElement>(null);
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const wheelGestureStateRef = useRef(createPhotoWheelGestureState());
  // Keep the wheel listener stable while the selected photo changes so the
  // momentum tail cannot be mistaken for a fresh gesture after every render.
  const navigationContextRef = useRef({
    currentIndex,
    photoCount: photos.length,
    onPrevious,
    onNext,
  });
  navigationContextRef.current = {
    currentIndex,
    photoCount: photos.length,
    onPrevious,
    onNext,
  };
  const closeInfo = useCallback(() => setIsInfoOpen(false), []);
  const closeShare = useCallback(() => setIsShareOpen(false), []);
  useClickOutside(infoContainerRef, closeInfo, isInfoOpen);
  useClickOutside(shareContainerRef, closeShare, isShareOpen);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotionRef.current = media.matches;
    };

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  const clearWheelIdleTimer = useCallback(() => {
    if (wheelIdleTimerRef.current === null) return;
    window.clearTimeout(wheelIdleTimerRef.current);
    wheelIdleTimerRef.current = null;
  }, []);

  const settleGestureOffset = useCallback((animate = true) => {
    const stage = photoStageRef.current;
    if (!stage) return;

    const shouldAnimate = animate && !reducedMotionRef.current;
    stage.dataset.tracking = shouldAnimate ? "false" : "true";
    stage.style.setProperty("--photo-drag-x", "0px");

    if (!shouldAnimate) {
      window.setTimeout(() => {
        if (stage.isConnected) stage.dataset.tracking = "false";
      }, 0);
    }
  }, []);

  const updateGestureFromDelta = useCallback(
    (deltaX: number, source: PhotoGestureSource) => {
      const stage = photoStageRef.current;
      if (!stage || reducedMotionRef.current) return;

      const viewportWidth = imageContainerRef.current?.clientWidth ?? 0;
      const { currentIndex: activeIndex, photoCount } =
        navigationContextRef.current;
      const offset = getPhotoGestureOffset({
        deltaX,
        viewportWidth,
        canGoPrevious: activeIndex > 0,
        canGoNext: activeIndex < photoCount - 1,
        source,
      });

      stage.dataset.tracking = "true";
      stage.style.setProperty("--photo-drag-x", `${offset}px`);
    },
    [],
  );

  const navigatePhoto = useCallback(
    (
      direction: PhotoNavigationDirection,
      source: PhotoNavigationSource,
    ) => {
      const {
        currentIndex: activeIndex,
        photoCount,
        onPrevious: navigatePrevious,
        onNext: navigateNext,
      } = navigationContextRef.current;
      const canNavigate =
        direction === "previous"
          ? activeIndex > 0
          : activeIndex < photoCount - 1;
      const animate = source !== "keyboard";

      if (!canNavigate) {
        settleGestureOffset(animate);
        return;
      }

      settleGestureOffset(animate);

      if (direction === "previous") {
        navigatePrevious();
      } else {
        navigateNext();
      }

    },
    [settleGestureOffset],
  );

  useEffect(() => {
    // Mobile keeps native vertical wheel scrolling for the information panel;
    // touch swipes already handle photo navigation there.
    if (isMobileView) return;

    const container = imageContainerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      const result = handlePhotoWheelGesture(
        wheelGestureStateRef.current,
        event,
      );
      wheelGestureStateRef.current = result.state;

      if (!result.captured) return;

      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
      clearWheelIdleTimer();
      wheelIdleTimerRef.current = window.setTimeout(() => {
        wheelIdleTimerRef.current = null;
        settleGestureOffset();
      }, PHOTO_WHEEL_GESTURE_IDLE_MS);

      if (result.navigation) {
        navigatePhoto(result.navigation, "wheel");
      } else if (result.gestureDeltaX !== 0) {
        updateGestureFromDelta(-result.gestureDeltaX, "wheel");
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      clearWheelIdleTimer();
      wheelGestureStateRef.current = createPhotoWheelGestureState();
    };
  }, [
    clearWheelIdleTimer,
    isMobileView,
    navigatePhoto,
    settleGestureOffset,
    updateGestureFromDelta,
  ]);

  useEffect(() => {
    mobileScrollRef.current?.scrollTo({ top: 0 });
    setIsShareOpen(false);
  }, [photo.id]);

  // Swipe handlers for mobile navigation and direct gesture tracking
  const swipeHandlers = useSwipeable({
    onSwiping: ({ deltaX, dir }) => {
      if (dir !== "Left" && dir !== "Right") return;
      updateGestureFromDelta(deltaX, "touch");
    },
    onSwiped: ({ absX, dir, velocity }) => {
      if (
        (dir !== "Left" && dir !== "Right") ||
        !shouldCommitTouchPhotoSwipe({
          distance: absX,
          velocity,
          viewportWidth: imageContainerRef.current?.clientWidth ?? 0,
        })
      ) {
        settleGestureOffset();
        return;
      }

      navigatePhoto(dir === "Left" ? "next" : "previous", "touch");
    },
    trackMouse: false,
    delta: 10,
    preventScrollOnSwipe: false,
  });

  // The carousel renders ±1; preload one additional photo for rapid browsing.
  useEffect(() => {
    for (const index of [currentIndex - 2, currentIndex + 2]) {
      if (index >= 0 && index < photos.length) {
        preloadImage(photos[index].url);
      }
    }
  }, [currentIndex, photos]);

  // Handle keyboard navigation (only when Photos app is focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if Photos app is focused
      const photosApp = document.querySelector('[data-app="photos"]');
      if (!photosApp?.contains(document.activeElement) && document.activeElement !== photosApp) {
        return;
      }

      if (e.key === "ArrowLeft") {
        navigatePhoto("previous", "keyboard");
      } else if (e.key === "ArrowRight") {
        navigatePhoto("next", "keyboard");
      } else if (e.key === "Escape") {
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigatePhoto, onBack]);

  const formattedDate = formatPhotoDate(photo.takenAt);
  const slideIndexes = [currentIndex - 1, currentIndex, currentIndex + 1].filter(
    (index) => index >= 0 && index < photos.length,
  );
  const mobileFormattedDate = formatPhotoDateMobile(photo.takenAt);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - matches PhotosGrid header style */}
      <PhotosHeader
        isMobileView={isMobileView}
        className="justify-between"
        onMouseDown={inShell && !isMobileView ? windowFocus.onDragStart : undefined}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Back to photo grid"
          className="flex items-center -ml-2"
        >
          <ChevronLeft
            className={cn(
              isMobileView
                ? "h-7 w-7 text-muted-foreground"
                : "h-5 w-5 text-foreground",
            )}
          />
        </button>

        {/* Date and counter */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-max max-w-[calc(100%-9rem)] -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="truncate text-sm font-medium">{formattedDate}</p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {currentIndex + 1} of {photos.length}
          </p>
        </div>

        {/* Photo actions */}
        <div
          className="flex items-center gap-1 -mr-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {!isMobileView && (
            <div
              ref={infoContainerRef}
              className="relative"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label={isInfoOpen ? "Hide photo information" : "Show photo information"}
                aria-expanded={isInfoOpen}
                aria-controls="photo-info-panel"
                onClick={() => {
                  setIsInfoOpen((open) => !open);
                  closeShare();
                }}
                className={cn(
                  "rounded-md p-1 text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A7CFF]",
                  isInfoOpen
                    ? "bg-foreground/10"
                    : "can-hover:hover:bg-foreground/10"
                )}
              >
                <Info className="h-5 w-5" />
              </button>

              {isInfoOpen && (
                <aside
                  id="photo-info-panel"
                  aria-label="Photo information"
                  className="absolute right-0 top-[calc(100%+12px)] z-20 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-xl border border-black/10 bg-muted/95 text-foreground shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl dark:border-white/15"
                >
                  <div className="relative flex h-8 items-center justify-center border-b border-black/10 px-3 dark:border-white/10">
                    <div className="group absolute left-3 flex gap-1.5">
                      <button
                        type="button"
                        aria-label="Close photo information"
                        onClick={closeInfo}
                        className="relative flex h-2.5 w-2.5 items-center justify-center rounded-full bg-muted-foreground/30 transition-colors can-hover:group-hover:bg-[#FF5F57] focus-visible:bg-[#FF5F57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A7CFF]"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 10 10"
                          className="h-2 w-2 text-black/55 opacity-0 transition-opacity can-hover:group-hover:opacity-100 group-focus-within:opacity-100"
                          fill="currentColor"
                        >
                          <path d="M2.2 1.4 5 4.2l2.8-2.8.8.8L5.8 5l2.8 2.8-.8.8L5 5.8 2.2 8.6l-.8-.8L4.2 5 1.4 2.2z" />
                        </svg>
                      </button>
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30"
                      />
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30"
                      />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Info</p>
                  </div>

                  <div className="max-h-[calc(100vh-112px)] overflow-y-auto">
                    <div className="flex items-start justify-between gap-3 px-3 py-3">
                      <div className="min-w-0">
                        <p className="break-all text-sm font-medium leading-5">{photo.caption ?? photo.alt}</p>
                        <time
                          dateTime={photo.takenAt}
                          className="mt-0.5 block text-xs leading-4 text-muted-foreground"
                        >
                          {formattedDate}
                        </time>
                      </div>
                      <Heart
                        aria-label={photo.isFavorite ? "Favorite" : "Not a favorite"}
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground",
                          photo.isFavorite && "fill-foreground text-foreground"
                        )}
                      />
                    </div>

                    <CameraDetails photo={photo} variant="desktop" />

                    <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-2 border-t border-black/10 px-3 py-3 text-xs dark:border-white/10">
                      <dt className="text-muted-foreground">Favorite</dt>
                      <dd>{photo.isFavorite ? "Yes" : "No"}</dd>
                      <dt className="text-muted-foreground">Album</dt>
                      <dd className="min-w-0 break-words">
                        {albumName ?? "None"}
                      </dd>
                    </dl>
                  </div>
                </aside>
              )}
            </div>
          )}

          {!isMobileView && (
            <div
              ref={shareContainerRef}
              className="relative"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Share photo"
                aria-haspopup="menu"
                aria-expanded={isShareOpen}
                aria-controls="photo-share-menu"
                onClick={() => {
                  setIsShareOpen((open) => !open);
                  closeInfo();
                }}
                className={cn(
                  "rounded-md p-1 text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A7CFF]",
                  isShareOpen
                    ? "bg-foreground/10"
                    : "can-hover:hover:bg-foreground/10",
                )}
              >
                <Share aria-hidden="true" className="h-5 w-5" />
              </button>

              {isShareOpen && (
                <div
                  id="photo-share-menu"
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-20 w-max min-w-44 rounded-lg border border-black/10 bg-white/95 p-1 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-800/95"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      void copyPhotoLink(photo.viewerUrl).then(() => {
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1500);
                      });
                      closeShare();
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-xs transition-colors can-hover:hover:bg-[#0A7CFF] can-hover:hover:text-white focus-visible:bg-[#0A7CFF] focus-visible:text-white focus-visible:outline-none"
                  >
                    <Link2 className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
                    {copied ? "Link Copied" : "Copy Link"}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => onToggleFavorite?.(photo.id)}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 rounded can-hover:hover:bg-muted"
            aria-label={
              photo.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            title={photo.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-colors text-foreground",
                photo.isFavorite && "fill-foreground"
              )}
            />
          </button>
        </div>
      </PhotosHeader>

      <div
        ref={mobileScrollRef}
        className={cn(
          "flex-1 min-h-0 bg-background",
          isMobileView ? "overflow-y-auto" : "overflow-hidden"
        )}
      >
        {/* Photo with horizontal swipe navigation and native vertical reveal on mobile */}
        <div
          {...swipeHandlers}
          onTouchCancel={() => settleGestureOffset()}
          className="flex h-full touch-pan-y items-center justify-center bg-muted/30"
        >
          <div
            ref={imageContainerRef}
            className="relative h-full w-full overflow-hidden overscroll-x-none"
          >
            <div
              ref={photoStageRef}
              data-tracking="false"
              className="group absolute inset-0"
              style={{ "--photo-drag-x": "0px" } as CSSProperties}
            >
              {slideIndexes.map((slideIndex) => {
                const slidePhoto = photos[slideIndex];
                const isCurrentSlide = slideIndex === currentIndex;

                return (
                  <div
                    key={slidePhoto.id}
                    aria-hidden={!isCurrentSlide}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform transition-transform group-data-[tracking=true]:transition-none motion-reduce:transition-none"
                    style={{
                      transform: getPhotoSlideTransform(
                        slideIndex - currentIndex,
                      ),
                      transitionDuration: `${PHOTO_SLIDE_DURATION_MS}ms`,
                      transitionTimingFunction: PHOTO_SLIDE_EASING,
                    }}
                  >
                    <PhotoSlide photo={slidePhoto} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {isMobileView && (
          <section
            id="mobile-photo-info"
            aria-label="Photo information"
            className="border-t border-muted-foreground/20 bg-background px-4 pb-16 pt-5"
          >
            <div className="mb-4">
              <time
                dateTime={photo.takenAt}
                className="block text-base font-medium leading-6"
              >
                {mobileFormattedDate}
              </time>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                {photo.caption ?? photo.alt}
              </p>
            </div>

            <CameraDetails photo={photo} variant="mobile" />

            <dl className="mt-4 grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-xl bg-muted/70 px-3 py-3 text-sm">
              <dt className="text-muted-foreground">Favorite</dt>
              <dd>{photo.isFavorite ? "Yes" : "No"}</dd>
              <dt className="text-muted-foreground">Album</dt>
              <dd className="min-w-0 break-words">
                {albumName ?? "None"}
              </dd>
            </dl>
          </section>
        )}
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

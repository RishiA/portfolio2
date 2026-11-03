"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useMemo } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/v2/utils";
import { usePhotos } from "@/lib/v2/photos/use-photos";
import {
  GRADIENT_WALLPAPERS,
  gradientCssValue,
  wallpaperCssValue
} from "@/lib/v2/settings/wallpapers";
import { useSystemSettings } from "@/lib/v2/system-settings-context";

const SELECTED_RING = "border-[#0A7CFF] ring-2 ring-[#0A7CFF] ring-offset-2 ring-offset-background";

function SelectedBadge() {
  return (
    <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0A7CFF] shadow-sm">
      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
    </span>
  );
}

export function WallpaperPanel() {
  const { wallpaper, setWallpaper } = useSystemSettings();
  const { photos, loading, error } = usePhotos();

  const wallpaperPhotos = useMemo(
    () => photos.filter((photo) => photo.useAsWallpaper).sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt)),
    [photos]
  );

  const activeGradient = wallpaper.kind === "gradient" ? GRADIENT_WALLPAPERS.find((item) => item.id === wallpaper.id) : undefined;
  const activePhoto = wallpaper.kind === "photo" ? wallpaperPhotos.find((photo) => photo.viewerUrl === wallpaper.url) : undefined;
  const currentName = activeGradient?.name ?? activePhoto?.alt ?? "Photo";

  return (
    <div data-setting-search-id="wallpaper" className="mx-auto w-full max-w-5xl space-y-8 p-6 pb-10" data-testid="settings-wallpaper-panel">
      <section className="grid grid-cols-[minmax(220px,0.9fr)_minmax(250px,1.1fr)] items-center gap-5">
        <div
          className="aspect-[8/5] overflow-hidden rounded-xl border border-border/70 bg-muted bg-cover bg-center shadow-sm"
          style={{ backgroundImage: wallpaperCssValue(wallpaper) }}
          data-testid="wallpaper-preview"
          role="img"
          aria-label="Current wallpaper"
        />
        <div className="rounded-2xl bg-muted/50 p-5">
          <p className="text-sm text-muted-foreground">Current wallpaper</p>
          <h2 className="mt-1 text-xl font-semibold">{currentName}</h2>
          <p className="mt-2 text-sm text-muted-foreground">This wallpaper appears on the desktop.</p>
        </div>
      </section>

      <section aria-labelledby="gradient-wallpapers-heading">
        <h2 id="gradient-wallpapers-heading" className="mb-3 text-base font-semibold">
          Gradients
        </h2>
        <div className="flex flex-wrap gap-3 pb-3">
          {GRADIENT_WALLPAPERS.map((gradient) => {
            const isSelected = wallpaper.kind === "gradient" && wallpaper.id === gradient.id;
            return (
              <button
                key={gradient.id}
                type="button"
                aria-label={`Use ${gradient.name} wallpaper`}
                aria-pressed={isSelected}
                onClick={() => setWallpaper({ kind: "gradient", id: gradient.id })}
                className="group w-[120px] shrink-0 text-left focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "relative block aspect-[8/5] overflow-hidden rounded-lg border bg-muted transition-shadow",
                    isSelected ? SELECTED_RING : "border-border/70 can-hover:group-hover:ring-2 can-hover:group-hover:ring-foreground/15"
                  )}
                  style={{ backgroundImage: gradientCssValue(gradient.id) }}
                >
                  {isSelected && <SelectedBadge />}
                </span>
                <span className="mt-2 block truncate text-center text-sm font-medium">{gradient.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="your-photos-heading">
        <h2 id="your-photos-heading" className="mb-3 text-base font-semibold">
          Your Photos
        </h2>
        {wallpaperPhotos.length > 0 ? (
          <div className="flex flex-wrap items-start gap-4">
            {wallpaperPhotos.map((photo) => {
              const isSelected = wallpaper.kind === "photo" && wallpaper.url === photo.viewerUrl;
              return (
                <button
                  key={photo.id}
                  type="button"
                  aria-label={`Use ${photo.alt} as wallpaper`}
                  aria-pressed={isSelected}
                  onClick={() => setWallpaper({ kind: "photo", url: photo.viewerUrl })}
                  className="group w-[120px] text-left focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "relative block aspect-[8/5] overflow-hidden rounded-lg border bg-muted transition-shadow",
                      isSelected ? SELECTED_RING : "border-border/70 can-hover:group-hover:ring-2 can-hover:group-hover:ring-foreground/15"
                    )}
                  >
                    <Image src={photo.thumbnailUrl} alt="" fill sizes="120px" className="object-cover" unoptimized />
                    {isSelected && <SelectedBadge />}
                  </span>
                  <span className="mt-2 block truncate text-center text-sm font-medium">{photo.alt}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground" data-testid="wallpaper-photos-empty">
            {loading
              ? "Loading photos…"
              : error
                ? "Photos couldn’t be loaded. Try again in a moment."
                : "Photos marked as wallpaper in the Studio appear here."}
          </p>
        )}
      </section>
    </div>
  );
}

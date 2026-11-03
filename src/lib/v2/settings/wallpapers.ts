export interface GradientWallpaper {
  id: string;
  name: string;
}

/** Each gradient has a light and a dark colour set, defined as `--v2-wallpaper-<id>` in src/app/v2/tailwind.css. */
export const GRADIENT_WALLPAPERS: GradientWallpaper[] = [
  { id: "dawn", name: "Dawn" },
  { id: "lagoon", name: "Lagoon" },
  { id: "meadow", name: "Meadow" },
  { id: "dusk", name: "Dusk" }
];

export const DEFAULT_GRADIENT_ID = "dawn";

export type Wallpaper = { kind: "gradient"; id: string } | { kind: "photo"; url: string };

export const DEFAULT_WALLPAPER: Wallpaper = { kind: "gradient", id: DEFAULT_GRADIENT_ID };

const GRADIENT_PREFIX = "gradient:";
const PHOTO_PREFIX = "photo:";

function isImageUrl(value: string): boolean {
  return value.startsWith("https://") || value.startsWith("/");
}

function isGradientId(id: string): boolean {
  return GRADIENT_WALLPAPERS.some((gradient) => gradient.id === id);
}

/** Reads a stored value. Anything unrecognised falls back to the default gradient. */
export function parseWallpaper(stored: string | null): Wallpaper {
  if (!stored) return DEFAULT_WALLPAPER;
  if (stored.startsWith(GRADIENT_PREFIX)) {
    const id = stored.slice(GRADIENT_PREFIX.length);
    return isGradientId(id) ? { kind: "gradient", id } : DEFAULT_WALLPAPER;
  }
  if (stored.startsWith(PHOTO_PREFIX)) {
    const url = stored.slice(PHOTO_PREFIX.length);
    return isImageUrl(url) ? { kind: "photo", url } : DEFAULT_WALLPAPER;
  }
  // Earlier versions stored the bare image URL.
  return isImageUrl(stored) ? { kind: "photo", url: stored } : DEFAULT_WALLPAPER;
}

export function serializeWallpaper(wallpaper: Wallpaper): string | null {
  if (wallpaper.kind === "photo") return `${PHOTO_PREFIX}${wallpaper.url}`;
  return wallpaper.id === DEFAULT_GRADIENT_ID ? null : `${GRADIENT_PREFIX}${wallpaper.id}`;
}

export function gradientCssValue(id: string): string {
  return `var(--v2-wallpaper-${id})`;
}

export function wallpaperCssValue(wallpaper: Wallpaper): string {
  return wallpaper.kind === "photo" ? `url(${JSON.stringify(wallpaper.url)})` : gradientCssValue(wallpaper.id);
}

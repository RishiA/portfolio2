import { beforeEach, describe, expect, it } from "vitest";
import { mapPhoto } from "@/lib/sanity/mappers";
import { loadFavorites, loadPhotosView, saveFavorites, toggleFavoriteId } from "@/lib/v2/photos/favorites";
import { formatDateRange, filterPhotosForView, groupPhotosByTime } from "@/lib/v2/photos/time-groups";
import type { LibraryPhoto } from "@/lib/v2/photos/types";
import { formatCameraName, formatExposureTime, formatLensDescription } from "@/lib/v2/photos/photo-metadata";

const rawPhoto = (overrides: Record<string, unknown> = {}) => ({
  id: "photo-a",
  assetId: "image-abc123-4000x3000-jpg",
  hotspot: null,
  crop: null,
  asset: {
    size: 2_500_000,
    mimeType: "image/jpeg",
    metadata: {
      dimensions: { width: 4000, height: 3000 },
      lqip: "data:image/jpeg;base64,AAAA",
      exif: { Make: "Apple", Model: "iPhone 15 Pro", ISO: 64, FNumber: 1.8, ExposureTime: 0.008, ExposureBiasValue: 0 }
    }
  },
  takenAt: "2024-06-15T12:00:00Z",
  caption: " Harbor ",
  alt: "Boats in a harbor",
  album: "places",
  useAsWallpaper: null,
  ...overrides
});

const libraryPhoto = (id: string, takenAt: string, overrides: Partial<LibraryPhoto> = {}): LibraryPhoto => ({
  id,
  url: `https://cdn.sanity.io/${id}.jpg`,
  thumbnailUrl: `https://cdn.sanity.io/${id}.jpg?w=400`,
  viewerUrl: `https://cdn.sanity.io/${id}.jpg?w=1600`,
  width: 400,
  height: 300,
  takenAt,
  alt: id,
  useAsWallpaper: false,
  details: {},
  isFavorite: false,
  ...overrides
});

describe("mapPhoto", () => {
  it("maps a Sanity photo with thumbnail and viewer URLs", () => {
    const photo = mapPhoto(rawPhoto());

    expect(photo).toMatchObject({
      id: "photo-a",
      width: 4000,
      height: 3000,
      takenAt: "2024-06-15T12:00:00Z",
      caption: "Harbor",
      alt: "Boats in a harbor",
      album: "places",
      useAsWallpaper: false,
      lqip: "data:image/jpeg;base64,AAAA"
    });
    expect(photo.thumbnailUrl).toContain("cdn.sanity.io/images/");
    expect(photo.thumbnailUrl).toContain("w=400");
    expect(photo.thumbnailUrl).toContain("q=75");
    expect(photo.viewerUrl).toContain("w=1600");
    expect(photo.viewerUrl).toContain("q=85");
    expect(photo.details).toMatchObject({ make: "Apple", model: "iPhone 15 Pro", iso: 64, fileSize: 2_500_000, mimeType: "image/jpeg" });
  });

  it("applies the crop to the reported dimensions", () => {
    const photo = mapPhoto(rawPhoto({ crop: { top: 0, bottom: 0, left: 0.25, right: 0.25 } }));
    expect(photo.width).toBe(2000);
    expect(photo.height).toBe(3000);
  });

  it("defaults optional fields", () => {
    const photo = mapPhoto(rawPhoto({ caption: null, album: null, useAsWallpaper: true, asset: { ...rawPhoto().asset, metadata: { dimensions: { width: 10, height: 10 } } } }));
    expect(photo.caption).toBeUndefined();
    expect(photo.album).toBeUndefined();
    expect(photo.useAsWallpaper).toBe(true);
    expect(photo.details.make).toBeUndefined();
  });

  it("rejects an unknown album and a missing alt text", () => {
    expect(() => mapPhoto(rawPhoto({ album: "pets" }))).toThrow();
    expect(() => mapPhoto(rawPhoto({ alt: undefined }))).toThrow();
  });
});

describe("photo time grouping", () => {
  const photos = [
    libraryPhoto("c", "2025-05-15T12:00:00Z", { album: "people", isFavorite: true }),
    libraryPhoto("a", "2023-03-15T12:00:00Z", { album: "places" }),
    libraryPhoto("b", "2023-09-15T12:00:00Z", { album: "people" })
  ];

  it("filters by view and sorts oldest first", () => {
    expect(filterPhotosForView(photos, "library").map((p) => p.id)).toEqual(["a", "b", "c"]);
    expect(filterPhotosForView(photos, "favorites").map((p) => p.id)).toEqual(["c"]);
    expect(filterPhotosForView(photos, "people").map((p) => p.id)).toEqual(["b", "c"]);
  });

  it("groups by year, by month, and not at all", () => {
    const sorted = filterPhotosForView(photos, "library");
    expect(groupPhotosByTime(sorted, "years").map((g) => [g.key, g.photos.length])).toEqual([["2023", 2], ["2025", 1]]);
    expect(groupPhotosByTime(sorted, "months").map((g) => g.key)).toEqual(["March 2023", "September 2023", "May 2025"]);
    expect(groupPhotosByTime(sorted, "all")).toHaveLength(1);
  });

  it("formats the date range", () => {
    expect(formatDateRange([])).toBe("");
    expect(formatDateRange(filterPhotosForView(photos, "library"))).toBe("Mar 15, 2023 - May 15, 2025");
    expect(formatDateRange([photos[0]])).toBe("May 15, 2025");
  });
});

describe("photo favorites", () => {
  beforeEach(() => window.localStorage.clear());

  it("toggles an id without mutating the original set", () => {
    const original = new Set(["a"]);
    const added = toggleFavoriteId(original, "b");
    expect([...added]).toEqual(["a", "b"]);
    expect([...original]).toEqual(["a"]);
    expect([...toggleFavoriteId(added, "a")]).toEqual(["b"]);
  });

  it("saves and loads favorites from storage", () => {
    saveFavorites(new Set(["a", "b"]));
    expect([...loadFavorites()]).toEqual(["a", "b"]);
  });

  it("ignores corrupt stored data", () => {
    window.localStorage.setItem("v2-photos-favorites", "{not json");
    expect(loadFavorites().size).toBe(0);
    window.localStorage.setItem("v2-photos-favorites", JSON.stringify({ a: 1 }));
    expect(loadFavorites().size).toBe(0);
  });

  it("survives storage that throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      }
    };
    expect(loadFavorites(broken).size).toBe(0);
    expect(() => saveFavorites(new Set(["a"]), broken)).not.toThrow();
    expect(loadPhotosView(broken)).toBe("library");
  });
});

describe("photo metadata formatting", () => {
  it("formats camera, lens and exposure", () => {
    expect(formatCameraName({ make: "Apple", model: "iPhone 15 Pro" })).toBe("Apple iPhone 15 Pro");
    expect(formatCameraName({ make: "Apple", model: "Apple iPhone" })).toBe("Apple iPhone");
    expect(formatLensDescription({ focalLength35mm: 24, fNumber: 1.8 })).toBe("24 mm ƒ1.8");
    expect(formatExposureTime(0.008)).toBe("1/125 s");
  });
});

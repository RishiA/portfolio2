import path from "node:path";
import type { Page } from "@playwright/test";

const IMAGE_HOST = "https://cdn.sanity.io/mock";
const FIXTURE_DIR = path.join(__dirname, "fixtures", "photos");

const SPECS = [
  { n: 1, w: 600, h: 450, takenAt: "2023-03-15T12:00:00Z", album: "places", alt: "Orange gradient", caption: "Coast road" },
  { n: 2, w: 450, h: 600, takenAt: "2023-09-15T12:00:00Z", album: "people", alt: "Blue gradient", caption: "Friends at the lake" },
  { n: 3, w: 600, h: 400, takenAt: "2024-02-15T12:00:00Z", album: "food", alt: "Green gradient", caption: "Dinner" },
  { n: 4, w: 500, h: 500, takenAt: "2024-07-15T12:00:00Z", album: "things", alt: "Yellow gradient", caption: undefined },
  { n: 5, w: 600, h: 450, takenAt: "2025-01-15T12:00:00Z", album: "places", alt: "Purple gradient", caption: "Snow day" },
  { n: 6, w: 450, h: 600, takenAt: "2025-05-15T12:00:00Z", album: "people", alt: "Pink gradient", caption: undefined }
] as const;

export function buildMockPhotos() {
  return [...SPECS]
    .map((spec) => ({
      id: `photo-${spec.n}`,
      url: `${IMAGE_HOST}/photo-${spec.n}.png`,
      thumbnailUrl: `${IMAGE_HOST}/photo-${spec.n}.png?w=400&q=75`,
      viewerUrl: `${IMAGE_HOST}/photo-${spec.n}.png?w=1600&q=85`,
      width: spec.w,
      height: spec.h,
      takenAt: spec.takenAt,
      caption: spec.caption,
      alt: spec.alt,
      album: spec.album,
      useAsWallpaper: false,
      details: spec.n === 1 ? { make: "Apple", model: "iPhone 15 Pro", iso: 64, fNumber: 1.8, focalLength35mm: 24, exposureTime: 0.008, fileSize: 8950, mimeType: "image/png" } : {}
    }))
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt));
}

export async function mockPhotosApi(page: Page, data: unknown[] = buildMockPhotos()) {
  await page.route("**/api/v2/photos", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify({ version: 1, data }) })
  );
  await page.route(`${IMAGE_HOST}/**`, (route) => {
    const file = new URL(route.request().url()).pathname.split("/").pop() ?? "";
    return route.fulfill({ contentType: "image/png", path: path.join(FIXTURE_DIR, file) });
  });
}

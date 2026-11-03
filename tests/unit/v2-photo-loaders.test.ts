import { describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
vi.mock("@/lib/sanity/client", () => ({
  isSanityConfigured: true,
  sanityConfig: { projectId: "test", dataset: "production" },
  sanityClient: { fetch: (...args: unknown[]) => fetchMock(...args) }
}));

const validPhoto = {
  id: "photo-a",
  assetId: "image-abc123-4000x3000-jpg",
  hotspot: null,
  crop: null,
  asset: { size: 1, mimeType: "image/jpeg", metadata: { dimensions: { width: 4000, height: 3000 }, lqip: null } },
  takenAt: "2024-06-15T12:00:00Z",
  caption: null,
  alt: "Boats in a harbor",
  album: "places",
  useAsWallpaper: null
};

describe("getPhotos", () => {
  it("skips a photo that fails validation and keeps the rest", async () => {
    fetchMock.mockResolvedValueOnce([validPhoto, { ...validPhoto, id: "photo-b", takenAt: null }]);
    const { getPhotos } = await import("@/lib/sanity/photo-loaders");

    const photos = await getPhotos();

    expect(photos.map((photo) => photo.id)).toEqual(["photo-a"]);
  });
});

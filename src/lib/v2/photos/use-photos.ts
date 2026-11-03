// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Photo } from "@/types/content";
import { loadFavorites, saveFavorites, toggleFavoriteId } from "./favorites";
import type { LibraryPhoto } from "./types";

interface PhotosResponse {
  version: number;
  data: Photo[];
}

function isPhotosResponse(value: unknown): value is PhotosResponse {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Partial<PhotosResponse>;
  return body.version === 1 && Array.isArray(body.data);
}

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
    const controller = new AbortController();

    fetch("/api/v2/photos", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Photos request failed");
        return response.json() as Promise<unknown>;
      })
      .then((body) => {
        if (!isPhotosResponse(body)) throw new Error("Unexpected photos response");
        setPhotos(body.data);
        setLoading(false);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Error fetching photos:", requestError);
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const toggleFavorite = useCallback((photoId: string) => {
    setFavorites((current) => {
      const next = toggleFavoriteId(current, photoId);
      saveFavorites(next);
      return next;
    });
  }, []);

  const libraryPhotos = useMemo<LibraryPhoto[]>(
    () => photos.map((photo) => ({ ...photo, isFavorite: favorites.has(photo.id) })),
    [photos, favorites]
  );

  return { photos: libraryPhotos, loading, error, toggleFavorite };
}

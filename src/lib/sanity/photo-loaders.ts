import { cache } from "react";
import { isSanityConfigured, sanityClient } from "@/lib/sanity/client";
import { mapPhoto } from "@/lib/sanity/mappers";
import { photosQuery, wallpaperPhotosQuery } from "@/lib/sanity/queries";
import type { Photo } from "@/types/content";

const fetchPhotos = async (query: string): Promise<Photo[]> => {
  if (!isSanityConfigured || !sanityClient) {
    return [];
  }
  try {
    const data = await sanityClient.fetch<unknown[]>(query);
    return (data ?? []).map(mapPhoto);
  } catch {
    return [];
  }
};

/** Photos newest first. Returns an empty list when Sanity is unreachable. */
export const getPhotos = cache(() => fetchPhotos(photosQuery));

/** Photos marked "use as wallpaper", newest first. */
export const getWallpaperPhotos = cache(() => fetchPhotos(wallpaperPhotosQuery));

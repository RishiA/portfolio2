// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import type { Photo } from "@/types/content";

export type LibraryPhoto = Photo & { isFavorite: boolean };

export interface Album {
  id: string;
  name: string;
}

export type PhotosView = "library" | "favorites" | string;
export type TimeFilter = "years" | "months" | "all";

export const PHOTO_ALBUMS: Album[] = [
  { id: "people", name: "People" },
  { id: "places", name: "Places" },
  { id: "food", name: "Food" },
  { id: "things", name: "Things" }
];

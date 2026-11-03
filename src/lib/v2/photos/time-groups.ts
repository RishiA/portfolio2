// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import { format, parseISO } from "date-fns";
import type { LibraryPhoto, PhotosView, TimeFilter } from "./types";

export interface PhotoGroup {
  key: string;
  photos: LibraryPhoto[];
}

/** Photos for a sidebar view, oldest first so the newest sit at the bottom of the grid. */
export function filterPhotosForView(photos: LibraryPhoto[], view: PhotosView): LibraryPhoto[] {
  let filtered: LibraryPhoto[];
  if (view === "library") filtered = photos;
  else if (view === "favorites") filtered = photos.filter((photo) => photo.isFavorite);
  else filtered = photos.filter((photo) => photo.album === view);

  return [...filtered].sort((a, b) => parseISO(a.takenAt).getTime() - parseISO(b.takenAt).getTime());
}

/** Splits oldest-first photos into Years or Months sections. "all" returns a single unlabeled group. */
export function groupPhotosByTime(photos: LibraryPhoto[], filter: TimeFilter): PhotoGroup[] {
  if (filter === "all") return [{ key: "all", photos }];

  const groups: PhotoGroup[] = [];
  for (const photo of photos) {
    const date = parseISO(photo.takenAt);
    const key = filter === "years" ? format(date, "yyyy") : format(date, "MMMM yyyy");
    const last = groups[groups.length - 1];
    if (last?.key === key) last.photos.push(photo);
    else groups.push({ key, photos: [photo] });
  }
  return groups;
}

/** "Jan 3, 2024 - Mar 9, 2025" for oldest-first photos, or an empty string with no photos. */
export function formatDateRange(photos: LibraryPhoto[]): string {
  if (photos.length === 0) return "";
  const earliest = format(parseISO(photos[0].takenAt), "MMM d, yyyy");
  const latest = format(parseISO(photos[photos.length - 1].takenAt), "MMM d, yyyy");
  return earliest === latest ? earliest : `${earliest} - ${latest}`;
}

export function formatPhotoDate(takenAt: string): string {
  return format(parseISO(takenAt), "MMMM d, yyyy 'at' h:mm:ss a");
}

export function formatPhotoDateMobile(takenAt: string): string {
  return format(parseISO(takenAt), "EEEE · MMMM d, yyyy · h:mm a");
}

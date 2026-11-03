import type { NoteListItem } from "@/lib/profile/types";

/** Path of the page that owns the content. Notes that exist only in v2 point at themselves. */
export function canonicalPathFor(item: Pick<NoteListItem, "kind" | "slug" | "url">): string {
  switch (item.kind) {
    case "work":
      return `/work/${item.slug}`;
    case "post":
      return `/blog/${item.slug}`;
    case "note":
      return `/notes/${item.slug}`;
    case "about":
      return "/about";
    default:
      return item.url;
  }
}

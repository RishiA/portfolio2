import { SHELL_NOTES_ROOT_PATH } from "@/lib/v2/shell-routing";

/** Slug of a link that points at another note in the v2 Notes app, or null for any other link. */
export function noteSlugFromHref(href: string): string | null {
  const prefix = `${SHELL_NOTES_ROOT_PATH}/`;
  if (!href.startsWith(prefix)) return null;
  const slug = href.slice(prefix.length).split(/[?#/]/)[0];
  if (!slug) return null;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

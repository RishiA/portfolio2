export interface AppleMusicTrackRef {
  /** The iTunes track id. */
  trackId: string;
  /** Two-letter storefront from the link path, such as "us". */
  storefront: string;
}

const DEFAULT_STOREFRONT = "us";

/**
 * Reads the song a music.apple.com link points to.
 *
 * Accepts a song link (`/us/song/name/123`) or an album link that names one song with `?i=123`.
 * Returns null for anything else, including an album link with no `i` parameter.
 */
export function parseAppleMusicTrackRef(input: string): AppleMusicTrackRef | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== "music.apple.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  const first = segments[0] ?? "";
  const hasStorefront = /^[a-z]{2}$/i.test(first);
  const storefront = hasStorefront ? first.toLowerCase() : DEFAULT_STOREFRONT;
  const kind = segments[hasStorefront ? 1 : 0];

  const queryId = url.searchParams.get("i");
  if (queryId !== null) {
    return kind === "album" && /^\d+$/.test(queryId) ? { trackId: queryId, storefront } : null;
  }

  if (kind === "song") {
    const last = segments[segments.length - 1];
    if (/^\d+$/.test(last) && segments.length > (hasStorefront ? 2 : 1)) {
      return { trackId: last, storefront };
    }
  }

  return null;
}

export function parseAppleMusicTrackId(input: string): string | null {
  return parseAppleMusicTrackRef(input)?.trackId ?? null;
}

export const APPLE_MUSIC_URL_MESSAGE =
  "Use a music.apple.com song link, or an album link that ends with ?i=<song id>.";

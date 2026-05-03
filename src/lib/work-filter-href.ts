export type WorkFiltersUi = "segments" | "facets" | "transitions";

export function parseWorkFiltersUi(value: string | undefined): WorkFiltersUi {
  if (value === "facets" || value === "transitions") return value;
  return "segments";
}

/** Shareable `/work` URLs; `segments` is default and omitted from query for cleaner links. */
export function workHref(tag: string, period: string, ui: WorkFiltersUi = "segments"): string {
  const q = new URLSearchParams();
  if (tag !== "all") q.set("tag", tag);
  if (period !== "all") q.set("period", period);
  if (ui !== "segments") q.set("ui", ui);
  const s = q.toString();
  return s ? `/work?${s}` : "/work";
}

/**
 * View transition policy for work filter navigations:
 * - Use document.startViewTransition + router.push when supported.
 * - Skip view transitions when prefers-reduced-motion: reduce (user OS setting).
 * - Allow modifier keys to bypass client handler for new tab / native behavior.
 * - List uses CSS view-transition-name: work-list (see globals.css); group timing ~240ms.
 */
export function shouldUseViewTransition(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  return typeof doc.startViewTransition === "function";
}

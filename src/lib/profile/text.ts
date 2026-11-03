import type { PortableTextValue } from "@/types/content";

export const EXCERPT_MAX_LENGTH = 160;

/** Collapses whitespace and removes anything that looks like markup. */
export function toPlainText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain-text excerpt, truncated at a word boundary with an ellipsis, 160 characters at most. */
export function makeExcerpt(input: string, max: number = EXCERPT_MAX_LENGTH): string {
  const text = toPlainText(input);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s.,;:!?-]+$/, "")}…`;
}

export function portableTextToPlain(body: PortableTextValue): string {
  return body
    .map((block) => (block._type === "block" ? block.children.map((child) => child.text).join("") : ""))
    .filter(Boolean)
    .join(" ");
}

export function hostnameOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "") || undefined;
  } catch {
    return undefined;
  }
}

export function toIsoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

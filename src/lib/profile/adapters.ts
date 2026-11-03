import { aboutContent, publicLinks } from "@/content/about";
import { sortWorkPeriodLabels } from "@/lib/sort-work-periods";
import type { BlogPost, Note, PlaygroundItem, WorkItem } from "@/types/content";
import type {
  ContactLink,
  Experience,
  NoteListItem,
  Profile,
  QuickLink
} from "./types";
import { hostnameOf, makeExcerpt, portableTextToPlain, toIsoDate } from "./text";

const noteUrl = (slug: string): `/v2/notes/${string}` => `/v2/notes/${slug}`;

export const RESUME_HREF = "/Resume";

export function buildContact(): ContactLink[] {
  return publicLinks.map((link) => ({ ...link }));
}

export function buildProfile(): Profile {
  return {
    name: "Rishi Athanikar",
    headline: aboutContent.headline,
    location: "New York",
    bio: aboutContent.paragraphs.map((segments) => segments.map((segment) => segment.text).join("")),
    links: buildContact()
  };
}

/** Career order: period rank (Present first, then by start year), then the item's own sortOrder. */
export function buildExperience(items: readonly WorkItem[]): Experience[] {
  const rank = new Map(
    sortWorkPeriodLabels([...new Set(items.map((item) => item.periodLabel))]).map((label, index) => [label, index])
  );
  return [...items]
    .sort(
      (a, b) =>
        (rank.get(a.periodLabel) ?? 0) - (rank.get(b.periodLabel) ?? 0) || a.sortOrder - b.sortOrder
    )
    .map((item) => ({
      organization: item.organization,
      roleTitle: item.roleTitle,
      periodLabel: item.periodLabel,
      summary: item.summary,
      workSlug: item.slug,
      sortOrder: item.sortOrder
    }));
}

export const LANDING_SLUGS = ["about-me", "proof-of-work", "playground", "quick-links"] as const;

const landingItem = (
  slug: (typeof LANDING_SLUGS)[number],
  kind: "about" | "landing",
  title: string,
  excerpt: string,
  emoji: string
): NoteListItem => ({
  slug,
  kind,
  title,
  excerpt: makeExcerpt(excerpt),
  emoji,
  pinRank: LANDING_SLUGS.indexOf(slug),
  collection: null,
  url: noteUrl(slug)
});

export function buildLandingItems(): NoteListItem[] {
  return [
    landingItem("about-me", "about", "About me", aboutContent.headline, "\u{1F44B}"),
    landingItem("proof-of-work", "landing", "Proof of work", "Where I have worked and what I shipped there.", "\u{1F4BC}"),
    landingItem("playground", "landing", "Playground", "Side projects and small experiments.", "\u{1F9EA}"),
    landingItem("quick-links", "landing", "Quick links", "Profiles, resume and the main notes in one place.", "\u{1F517}")
  ];
}

export function buildQuickLinks(): QuickLink[] {
  return [
    ...publicLinks.map((link): QuickLink => ({ kind: "profile", label: link.label, href: link.href })),
    { kind: "resume", label: "Resume", href: RESUME_HREF },
    ...buildLandingItems()
      .filter((item) => item.slug !== "quick-links")
      .map((item): QuickLink => ({ kind: "note", label: item.title, href: item.url }))
  ];
}

export function workToListItem(item: WorkItem): NoteListItem {
  return {
    slug: item.slug,
    kind: "work",
    title: item.title ?? `${item.organization}: ${item.roleTitle}`,
    excerpt: makeExcerpt(item.summary),
    collection: "work",
    url: noteUrl(item.slug)
  };
}

export function projectToListItem(item: PlaygroundItem): NoteListItem {
  return {
    slug: item.slug,
    kind: "project",
    title: item.name,
    excerpt: makeExcerpt(item.oneLiner),
    date: toIsoDate(item.lastUpdated),
    collection: "playground",
    url: noteUrl(item.slug)
  };
}

export function noteTitle(note: Note): string {
  const explicit = note.title?.trim();
  if (explicit) return explicit;
  const previewTitle = note.linkPreview?.title?.trim();
  if (note.kind === "link") {
    if (previewTitle) return previewTitle;
    const host = hostnameOf(note.sourceUrl ?? note.linkPreview?.url);
    if (host) return host;
  }
  return makeExcerpt(portableTextToPlain(note.body), 60) || "Untitled note";
}

export function noteExcerpt(note: Note): string {
  const fromBody = portableTextToPlain(note.body);
  if (fromBody.trim()) return makeExcerpt(fromBody);
  if (note.linkPreview?.description) return makeExcerpt(note.linkPreview.description);
  return makeExcerpt(hostnameOf(note.sourceUrl ?? note.linkPreview?.url) ?? "");
}

export function noteToListItem(note: Note): NoteListItem {
  return {
    slug: note.slug,
    kind: "note",
    title: noteTitle(note),
    excerpt: noteExcerpt(note),
    emoji: note.emoji,
    date: toIsoDate(note.publishedAt),
    collection: "notes",
    url: noteUrl(note.slug)
  };
}

export function postToListItem(post: BlogPost): NoteListItem {
  return {
    slug: post.slug,
    kind: "post",
    title: post.title,
    excerpt: makeExcerpt(post.excerpt || portableTextToPlain(post.body)),
    date: toIsoDate(post.publishedAt),
    collection: "writing",
    url: noteUrl(post.slug)
  };
}

export function assertUniqueSlugs(items: ReadonlyArray<{ slug: string }>): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { slug } of items) {
    if (seen.has(slug)) duplicates.add(slug);
    seen.add(slug);
  }
  if (duplicates.size > 0) {
    throw new Error(`Duplicate note slugs across content sources: ${[...duplicates].sort().join(", ")}`);
  }
}

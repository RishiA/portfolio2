import type { BlogPost, Note, PlaygroundItem, WorkItem } from "@/types/content";

export type ContactLinkId = "linkedin" | "github" | "x";

export interface ContactLink {
  id: ContactLinkId;
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  headline: string;
  location: string;
  /** Plain-text bio paragraphs. */
  bio: string[];
  links: ContactLink[];
}

export interface Experience {
  organization: string;
  roleTitle: string;
  periodLabel: string;
  summary: string;
  workSlug: string;
  /** Original sortOrder from the work item; breaks ties between equal period ranks. */
  sortOrder: number;
}

export type NoteKind = "about" | "landing" | "work" | "project" | "note" | "post";
export type NoteCollection = "work" | "playground" | "writing" | "notes";

export interface NoteListItem {
  slug: string;
  kind: NoteKind;
  title: string;
  /** Plain text, 160 characters or fewer. */
  excerpt: string;
  emoji?: string;
  /** Lower numbers sort first. Present only on pinned items. */
  pinRank?: number;
  /** ISO 8601 timestamp. */
  date?: string;
  collection: NoteCollection | null;
  url: `/v2/notes/${string}`;
}

export interface SearchHit {
  slug: string;
  kind: NoteKind;
  title: string;
  snippet: string;
  url: `/v2/notes/${string}`;
  date?: string;
}

export interface QuickLink {
  kind: "profile" | "resume" | "note";
  label: string;
  href: string;
}

export type LandingContent =
  | { id: "proof-of-work"; work: WorkItem[] }
  | { id: "playground"; projects: PlaygroundItem[] }
  | { id: "quick-links"; links: QuickLink[] };

export type NoteDetail =
  | { kind: "about"; item: NoteListItem; profile: Profile }
  | { kind: "landing"; item: NoteListItem; landing: LandingContent }
  | { kind: "work"; item: NoteListItem; source: WorkItem }
  | { kind: "project"; item: NoteListItem; source: PlaygroundItem }
  | { kind: "note"; item: NoteListItem; source: Note }
  | { kind: "post"; item: NoteListItem; source: BlogPost };

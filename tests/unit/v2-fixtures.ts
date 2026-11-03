import type { NoteListItem } from "@/lib/profile/types";

export const item = (overrides: Partial<NoteListItem> & { slug: string }): NoteListItem => ({
  kind: "note",
  title: overrides.slug,
  excerpt: "An excerpt.",
  collection: "notes",
  url: `/v2/notes/${overrides.slug}`,
  ...overrides
});

export const fixtureItems: NoteListItem[] = [
  item({ slug: "about-me", kind: "about", title: "About me", emoji: "\u{1F44B}", pinRank: 0, collection: null }),
  item({ slug: "rho", kind: "work", title: "Rho: Product Manager", excerpt: "Payments infrastructure.", collection: "work" }),
  item({ slug: "agent-demo", kind: "project", title: "Agent demo", excerpt: "A small agent.", collection: "playground", date: "2026-10-30T15:00:00.000Z" }),
  item({ slug: "on-money", kind: "post", title: "On money", excerpt: "Notes about rho and ledgers.", collection: "writing", date: "2026-10-01T15:00:00.000Z" }),
  item({ slug: "a-link", title: "A link", collection: "notes", date: "2026-01-05T15:00:00.000Z" })
];

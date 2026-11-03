import type { BlogPost, Note, PortableTextValue } from "@/types/content";

export const para = (text: string): PortableTextValue => [
  { _type: "block", style: "normal", children: [{ _type: "span", text }], markDefs: [] }
];

export const makeNote = (overrides: Partial<Note> & { slug: string }): Note => ({
  kind: "text",
  title: overrides.slug,
  body: para("A short note body."),
  tags: [],
  publishedAt: "2026-03-01T00:00:00.000Z",
  isPublished: true,
  ...overrides
});

export const makePost = (overrides: Partial<BlogPost> & { slug: string }): BlogPost => ({
  title: overrides.slug,
  excerpt: "A post excerpt.",
  body: para("Post body."),
  tags: [],
  publishedAt: "2026-03-01T00:00:00.000Z",
  isPublished: true,
  readingTimeMinutes: 1,
  ...overrides
});

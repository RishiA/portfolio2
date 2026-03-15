import readingTime from "reading-time";
import { z } from "zod";
import type { BlogPost, Note } from "@/types/content";

const portableTextBlockSchema = z.object({
  _type: z.literal("block"),
  children: z.array(
    z.object({
      _type: z.literal("span"),
      text: z.string(),
      marks: z.array(z.string()).optional()
    })
  )
});

const linkPreviewSchema = z.object({
  url: z.string().url(),
  canonicalUrl: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  siteName: z.string().optional(),
  image: z.string().url().optional(),
  favicon: z.string().url().optional(),
  publishedTime: z.string().optional()
});

const noteSchema = z.object({
  slug: z.string(),
  kind: z.enum(["text", "link"]),
  title: z.string().optional(),
  body: z.array(portableTextBlockSchema).default([]),
  sourceUrl: z.string().url().optional(),
  tags: z.array(z.object({ title: z.string(), slug: z.string() })).default([]),
  linkPreview: linkPreviewSchema.optional(),
  publishedAt: z.string(),
  isPublished: z.boolean().default(false)
});

const blogPostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  body: z.array(portableTextBlockSchema).default([]),
  coverImage: z.string().url().optional(),
  tags: z.array(z.object({ title: z.string(), slug: z.string() })).default([]),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  isPublished: z.boolean().default(false)
});

const normalizeTags = (tags: Array<{ title: string; slug: string }> = []) => tags.map((tag) => tag.slug);

export const mapNote = (input: unknown): Note => {
  const parsed = noteSchema.parse(input);

  return {
    slug: parsed.slug,
    kind: parsed.kind,
    title: parsed.title,
    body: parsed.body,
    sourceUrl: parsed.sourceUrl,
    linkPreview: parsed.linkPreview,
    tags: normalizeTags(parsed.tags),
    publishedAt: parsed.publishedAt,
    isPublished: parsed.isPublished
  };
};

export const mapBlogPost = (input: unknown): BlogPost => {
  const parsed = blogPostSchema.parse(input);

  const bodyText = parsed.body
    .map((block) => block.children.map((child) => child.text).join(" "))
    .join(" ");
  const readingTimeMinutes = Math.max(1, Math.ceil(readingTime(bodyText).minutes));

  return {
    slug: parsed.slug,
    title: parsed.title,
    excerpt: parsed.excerpt,
    body: parsed.body,
    coverImage: parsed.coverImage,
    tags: normalizeTags(parsed.tags),
    publishedAt: parsed.publishedAt,
    updatedAt: parsed.updatedAt,
    isPublished: parsed.isPublished,
    readingTimeMinutes
  };
};

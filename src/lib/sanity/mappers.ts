import readingTime from "reading-time";
import { z } from "zod";
import { autoLinkBody } from "@/lib/portable-text/auto-link";
import type { BlogPost, Note, PortableTextValue } from "@/types/content";

const portableTextSpanSchema = z.object({
  _type: z.literal("span"),
  _key: z.string().optional(),
  text: z.string(),
  marks: z.array(z.string()).optional()
});

const portableTextMarkDefSchema = z
  .object({
    _key: z.string(),
    _type: z.string(),
    href: z.string().optional()
  })
  .passthrough();

const portableTextBlockSchema = z.object({
  _type: z.literal("block"),
  _key: z.string().optional(),
  style: z.string().optional(),
  children: z.array(portableTextSpanSchema),
  markDefs: z.array(portableTextMarkDefSchema).nullish().transform((v) => v ?? [])
});

const linkEmbedBlockSchema = z.object({
  _type: z.literal("linkEmbed"),
  _key: z.string().optional(),
  url: z.string().url(),
  displayAs: z.enum(["card", "inline"]).default("card")
});

const youtubeEmbedBlockSchema = z.object({
  _type: z.literal("youtubeEmbed"),
  _key: z.string().optional(),
  url: z.string().url(),
  title: z.string().nullish().transform((v) => v ?? undefined)
});

const bodyBlockSchema = z.discriminatedUnion("_type", [
  portableTextBlockSchema,
  linkEmbedBlockSchema,
  youtubeEmbedBlockSchema
]);

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

const nullishArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(schema).nullish().transform((v) => v ?? []);

const noteSchema = z.object({
  slug: z.string(),
  kind: z.enum(["text", "link"]),
  title: z.string().nullish().transform((v) => v ?? undefined),
  body: nullishArray(bodyBlockSchema),
  sourceUrl: z.string().url().nullish().transform((v) => v ?? undefined),
  tags: nullishArray(z.object({ title: z.string(), slug: z.string() })),
  linkPreview: linkPreviewSchema.nullish().transform((v) => v ?? undefined),
  publishedAt: z.string(),
  isPublished: z.boolean().default(false)
});

const blogPostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  body: nullishArray(bodyBlockSchema),
  coverImage: z.string().url().nullish().transform((v) => v ?? undefined),
  tags: nullishArray(z.object({ title: z.string(), slug: z.string() })),
  publishedAt: z.string(),
  updatedAt: z.string().nullish().transform((v) => v ?? undefined),
  isPublished: z.boolean().default(false)
});

const normalizeTags = (tags: Array<{ title: string; slug: string }> = []) => tags.map((tag) => tag.slug);

const bodyTextForReadingTime = (body: PortableTextValue): string =>
  body
    .map((block) => {
      if (block._type === "block") {
        return block.children.map((child) => child.text).join(" ");
      }
      return block.url;
    })
    .join(" ");

export const mapNote = (input: unknown): Note => {
  const parsed = noteSchema.parse(input);
  const body = autoLinkBody(parsed.body as PortableTextValue);

  return {
    slug: parsed.slug,
    kind: parsed.kind,
    title: parsed.title,
    body,
    sourceUrl: parsed.sourceUrl,
    linkPreview: parsed.linkPreview,
    tags: normalizeTags(parsed.tags),
    publishedAt: parsed.publishedAt,
    isPublished: parsed.isPublished
  };
};

export const mapBlogPost = (input: unknown): BlogPost => {
  const parsed = blogPostSchema.parse(input);
  const body = autoLinkBody(parsed.body as PortableTextValue);
  const readingTimeMinutes = Math.max(1, Math.ceil(readingTime(bodyTextForReadingTime(body)).minutes));

  return {
    slug: parsed.slug,
    title: parsed.title,
    excerpt: parsed.excerpt,
    body,
    coverImage: parsed.coverImage,
    tags: normalizeTags(parsed.tags),
    publishedAt: parsed.publishedAt,
    updatedAt: parsed.updatedAt,
    isPublished: parsed.isPublished,
    readingTimeMinutes
  };
};

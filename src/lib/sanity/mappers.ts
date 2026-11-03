import imageUrlBuilder from "@sanity/image-url";
import readingTime from "reading-time";
import { z } from "zod";
import { sanityConfig } from "@/lib/sanity/client";
import { autoLinkBody } from "@/lib/portable-text/auto-link";
import type { BlogPost, Note, Photo, PhotoDetails, PortableTextValue } from "@/types/content";

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
  emoji: z.string().nullish().transform((v) => v ?? undefined),
  pinned: z.boolean().nullish().transform((v) => v ?? false),
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
    emoji: parsed.emoji,
    pinned: parsed.pinned,
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

const PHOTO_ALBUM_VALUES = ["people", "places", "food", "things"] as const;
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 75;
const VIEWER_WIDTH = 1600;
const VIEWER_QUALITY = 85;

const nullableNumber = z.preprocess((value) => (typeof value === "number" && Number.isFinite(value) ? value : undefined), z.number().optional());
const nullableString = z.preprocess((value) => (typeof value === "string" && value.trim() ? value.trim() : undefined), z.string().optional());

const photoExifSchema = z
  .object({
    Make: nullableString,
    Model: nullableString,
    LensModel: nullableString,
    FNumber: nullableNumber,
    FocalLengthIn35mmFormat: nullableNumber,
    ISO: nullableNumber,
    ExposureTime: nullableNumber,
    ExposureCompensation: nullableNumber,
    ExposureBiasValue: nullableNumber
  })
  .passthrough();

const photoSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  hotspot: z.object({ x: z.number(), y: z.number(), height: z.number(), width: z.number() }).nullish(),
  crop: z.object({ top: z.number(), bottom: z.number(), left: z.number(), right: z.number() }).nullish(),
  asset: z.object({
    size: nullableNumber,
    mimeType: nullableString,
    metadata: z
      .object({
        dimensions: z.object({ width: z.number(), height: z.number() }),
        lqip: nullableString,
        exif: photoExifSchema.nullish()
      })
      .passthrough()
  }),
  takenAt: z.string(),
  caption: z.string().nullish().transform((v) => v?.trim() || undefined),
  alt: z.string(),
  album: z.enum(PHOTO_ALBUM_VALUES).nullish().transform((v) => v ?? undefined),
  useAsWallpaper: z.boolean().nullish().transform((v) => v ?? false)
});

const photoImageBuilder = () =>
  imageUrlBuilder({
    projectId: sanityConfig.projectId ?? "unconfigured",
    dataset: sanityConfig.dataset
  });

export const mapPhoto = (input: unknown): Photo => {
  const parsed = photoSchema.parse(input);
  const { dimensions, lqip, exif } = parsed.asset.metadata;
  const source = { asset: { _ref: parsed.assetId }, hotspot: parsed.hotspot ?? undefined, crop: parsed.crop ?? undefined };
  const sized = (width: number, quality: number) =>
    photoImageBuilder().image(source).width(width).fit("max").quality(quality).auto("format").url();

  const crop = parsed.crop;
  const width = Math.round(dimensions.width * (1 - (crop?.left ?? 0) - (crop?.right ?? 0)));
  const height = Math.round(dimensions.height * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0)));

  const details: PhotoDetails = {
    make: exif?.Make,
    model: exif?.Model,
    lensModel: exif?.LensModel,
    fNumber: exif?.FNumber,
    focalLength35mm: exif?.FocalLengthIn35mmFormat,
    iso: exif?.ISO,
    exposureTime: exif?.ExposureTime,
    exposureCompensation: exif?.ExposureCompensation ?? exif?.ExposureBiasValue,
    fileSize: parsed.asset.size,
    mimeType: parsed.asset.mimeType
  };

  return {
    id: parsed.id,
    url: photoImageBuilder().image(source).url(),
    thumbnailUrl: sized(THUMBNAIL_WIDTH, THUMBNAIL_QUALITY),
    viewerUrl: sized(VIEWER_WIDTH, VIEWER_QUALITY),
    width,
    height,
    takenAt: parsed.takenAt,
    caption: parsed.caption,
    alt: parsed.alt,
    album: parsed.album,
    useAsWallpaper: parsed.useAsWallpaper,
    lqip,
    details
  };
};

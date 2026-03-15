import { z } from "zod";
import type { LinkPreview } from "@/types/content";

const previewSchema = z.object({
  url: z.string().url(),
  canonicalUrl: z.string().url().optional(),
  title: z.string().max(180).optional(),
  description: z.string().max(400).optional(),
  siteName: z.string().max(120).optional(),
  image: z.string().url().optional(),
  favicon: z.string().url().optional(),
  publishedTime: z.string().optional()
});

const clamp = (value: string | null | undefined, max: number) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
};

export function normalizeLinkPreview(input: Partial<LinkPreview> & { url: string }): LinkPreview {
  return previewSchema.parse({
    url: input.url,
    canonicalUrl: input.canonicalUrl,
    title: clamp(input.title, 180),
    description: clamp(input.description, 400),
    siteName: clamp(input.siteName, 120),
    image: input.image,
    favicon: input.favicon,
    publishedTime: input.publishedTime
  });
}

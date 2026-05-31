import type { Metadata } from "next";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  /** Skip the layout title template (used for the home page only). */
  titleAbsolute?: boolean;
  ogImage?: { url: string; width?: number; height?: number; alt?: string };
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

export function pageMetadata(input: PageMetadataInput): Metadata {
  const path = normalizePath(input.path);
  const url = new URL(path, baseUrl).toString();
  const image = input.ogImage ?? {
    url: "/images/rishi_sketch.webp",
    width: 900,
    height: 900,
    alt: "Rishi Athanikar"
  };

  return {
    title: input.titleAbsolute ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: {
      canonical: path
    },
    openGraph: {
      type: input.type ?? "website",
      siteName: "Rishi Athanikar",
      title: input.title,
      description: input.description,
      url,
      images: [image],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {})
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image.url]
    }
  };
}

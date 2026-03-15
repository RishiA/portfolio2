import { load } from "cheerio";
import { normalizeLinkPreview } from "@/lib/link-preview/normalize";
import type { LinkPreview } from "@/types/content";

const getMetaContent = ($: ReturnType<typeof load>, key: string, attribute: "property" | "name" = "property") =>
  $(`meta[${attribute}='${key}']`).attr("content")?.trim();

const toAbsolute = (base: string, value?: string) => {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, base).toString();
  } catch {
    return undefined;
  }
};

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http(s) URLs are supported");
  }

  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(8_000),
    headers: {
      "user-agent": "portfolio2-link-preview-bot/1.0"
    }
  });

  if (!res.ok) {
    throw new Error(`Failed metadata fetch: ${res.status}`);
  }

  const html = await res.text();
  const $ = load(html);

  const canonicalUrl = toAbsolute(url, $("link[rel='canonical']").attr("href")) || url;

  return normalizeLinkPreview({
    url,
    canonicalUrl,
    title: getMetaContent($, "og:title") || $("title").text(),
    description: getMetaContent($, "og:description") || getMetaContent($, "description", "name"),
    siteName: getMetaContent($, "og:site_name") || new URL(url).hostname,
    image: toAbsolute(url, getMetaContent($, "og:image")),
    favicon: toAbsolute(url, $("link[rel='icon']").attr("href")),
    publishedTime: getMetaContent($, "article:published_time")
  });
}

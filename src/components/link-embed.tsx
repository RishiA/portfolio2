import { cache } from "react";
import { LinkPreviewCard } from "@/components/link-preview-card";
import { fetchLinkPreview } from "@/lib/link-preview/fetch";
import type { LinkPreview } from "@/types/content";

const getPreview = cache(async (url: string): Promise<LinkPreview | null> => {
  try {
    return await fetchLinkPreview(url);
  } catch {
    return null;
  }
});

interface LinkEmbedProps {
  url: string;
  displayAs: "card" | "inline";
}

export async function LinkEmbed({ url, displayAs }: LinkEmbedProps) {
  if (displayAs === "inline") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="auto-link">
        {url}
      </a>
    );
  }

  const preview = await getPreview(url);
  if (!preview) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="auto-link">
        {url}
      </a>
    );
  }

  return <LinkPreviewCard preview={preview} />;
}

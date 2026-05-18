import type { LinkPreview } from "@/types/content";

interface LinkPreviewCardProps {
  preview: LinkPreview;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function LinkPreviewCard({ preview }: LinkPreviewCardProps) {
  const host = (preview.siteName ?? hostnameOf(preview.url)).toUpperCase();

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-preview"
      aria-label={`Open link: ${preview.title ?? preview.url}`}
    >
      {preview.image ? (
        <div
          className="link-preview-image"
          style={{ backgroundImage: `url(${preview.image})` }}
          role="presentation"
        />
      ) : null}
      <div className="link-preview-body">
        <p className="link-preview-site">{host}</p>
        <h3 className="link-preview-title">{preview.title ?? preview.url}</h3>
        {preview.description ? (
          <p className="link-preview-description">{preview.description}</p>
        ) : null}
      </div>
    </a>
  );
}

import type { LinkPreview } from "@/types/content";

interface LinkPreviewCardProps {
  preview: LinkPreview;
}

export function LinkPreviewCard({ preview }: LinkPreviewCardProps) {
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-preview"
      aria-label={`Open link: ${preview.title ?? preview.url}`}
    >
      <div>
        <p className="link-preview-site">{preview.siteName ?? "External link"}</p>
        <h3>{preview.title ?? preview.url}</h3>
        {preview.description ? <p>{preview.description}</p> : null}
      </div>
      <span>Visit ↗</span>
    </a>
  );
}

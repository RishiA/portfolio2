"use client";

import { useState } from "react";

interface CoverArtProps {
  src: string;
  alt: string;
}

/**
 * Album art that fills its parent. Falls back to a plain gradient when there is no
 * picture or it fails to load.
 *
 * This is a plain img on purpose. Apple's CDN already serves the 600x600 size we ask for,
 * so Next image optimization would only add a proxy hop and a remotePatterns entry.
 */
export function CoverArt({ src, alt }: CoverArtProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <div className="h-full w-full bg-gradient-to-br from-zinc-700 to-zinc-800" aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailedSrc(src)}
    />
  );
}

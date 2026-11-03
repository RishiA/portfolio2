"use client";

import { AppPlaceholder } from "@/components/v2/desktop/app-placeholder";
import type { V2AppProps } from "@/components/v2/apps/types";

export default function MusicApp({ isMobile = false }: V2AppProps) {
  return <AppPlaceholder name="Music" isMobile={isMobile} />;
}

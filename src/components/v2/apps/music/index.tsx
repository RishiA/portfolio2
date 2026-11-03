"use client";

import type { V2AppProps } from "@/components/v2/apps/types";
import App from "./app";

export default function MusicApp({ isMobile = false }: V2AppProps) {
  return (
    <div className="h-full w-full overflow-hidden">
      <App isDesktop={!isMobile} />
    </div>
  );
}

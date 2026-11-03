"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useEffect, useState } from "react";
import {
  SHELL_POINTER_MEDIA_QUERY,
  detectMobileClientFromWindow,
} from "@/lib/v2/device-detection";

const SHELL_ADDITIONAL_MEDIA_QUERIES = ["(any-pointer: coarse)", "(any-hover: none)"] as const;

export function useShellIsMobile(initialIsMobile?: boolean): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(
    typeof initialIsMobile === "boolean" ? initialIsMobile : null
  );

  useEffect(() => {
    const mediaQueries = [
      window.matchMedia(SHELL_POINTER_MEDIA_QUERY),
      ...SHELL_ADDITIONAL_MEDIA_QUERIES.map((query) => window.matchMedia(query)),
    ];

    const syncIsMobile = () => {
      setIsMobile(detectMobileClientFromWindow());
    };

    syncIsMobile();

    mediaQueries.forEach((mediaQuery) => {
      mediaQuery.addEventListener("change", syncIsMobile);
    });

    window.addEventListener("resize", syncIsMobile);

    return () => {
      mediaQueries.forEach((mediaQuery) => {
        mediaQuery.removeEventListener("change", syncIsMobile);
      });
      window.removeEventListener("resize", syncIsMobile);
    };
  }, []);

  return isMobile;
}

"use client";

import { useEffect, type RefObject } from "react";
import { shouldUseViewTransition } from "@/lib/work-filter-href";

type ClientRouter = { push: (href: string) => void };

export function useWorkFilterViewTransition(rootRef: RefObject<HTMLElement | null>, router: ClientRouter) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || !root.contains(a)) return;
      const href = a.getAttribute("href");
      if (!href?.startsWith("/work")) return;
      const dest = href.split("#")[0];
      const here = `${window.location.pathname}${window.location.search}`;
      if (dest === here) {
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;

      e.preventDefault();
      const go = () => {
        router.push(href);
      };
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      };
      if (shouldUseViewTransition() && typeof doc.startViewTransition === "function") {
        doc.startViewTransition(go);
      } else {
        go();
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [router, rootRef]);
}

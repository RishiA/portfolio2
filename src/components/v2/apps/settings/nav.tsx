"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/v2/utils";
import { useWindowNavBehavior } from "@/lib/v2/use-window-nav-behavior";

interface NavProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  isDesktop?: boolean;
  title?: string;
}

export function Nav({ canGoBack, canGoForward, onBack, onForward, isDesktop = false, title }: NavProps) {
  const nav = useWindowNavBehavior({ isDesktop, isMobile: false });

  return (
    <div
      className="sticky top-0 z-[1] flex select-none items-center gap-2 bg-muted px-4 py-2"
      data-window-drag-handle={nav.onDragStart ? "true" : undefined}
      onMouseDown={nav.onDragStart}
    >
      <button
        onClick={onBack}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={!canGoBack}
        className={cn(
          "rounded-md p-1 transition-colors",
          canGoBack ? "text-foreground can-hover:hover:bg-muted-foreground/10" : "cursor-not-allowed text-muted-foreground/40"
        )}
        aria-label="Go back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={onForward}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={!canGoForward}
        className={cn(
          "rounded-md p-1 transition-colors",
          canGoForward ? "text-foreground can-hover:hover:bg-muted-foreground/10" : "cursor-not-allowed text-muted-foreground/40"
        )}
        aria-label="Go forward"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      {title && <span className="ml-1 text-sm font-medium">{title}</span>}
    </div>
  );
}

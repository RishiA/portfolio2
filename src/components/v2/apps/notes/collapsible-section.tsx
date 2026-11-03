"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/v2/utils";

interface CollapsibleSectionProps {
  title: ReactNode;
  /** Plain text used for the button label. */
  label: string;
  level?: 2 | 3;
  children: ReactNode;
}

/** A heading with a chevron that hides the content below it, like the section headings in her notes. */
export function CollapsibleSection({ title, label, level = 2, children }: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const Heading = `h${level}` as "h2" | "h3";

  return (
    <section data-collapsible-section>
      <Heading className="group/heading" data-collapsible-section-heading data-collapsed={isCollapsed}>
        <button
          type="button"
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${label}`}
          className={cn(
            "flex w-full items-start rounded-md text-left text-inherit",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A7CFF] focus-visible:ring-offset-1"
          )}
          onClick={() => setIsCollapsed((current) => !current)}
        >
          <span
            className={cn(
              "mr-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground",
              "desktop:size-5",
              isCollapsed
                ? "desktop:opacity-100"
                : "desktop:opacity-0 desktop:can-hover:group-hover/heading:opacity-100 desktop:group-focus-within/heading:opacity-100"
            )}
          >
            <ChevronRight
              aria-hidden="true"
              className={cn("size-4 transition-transform motion-reduce:transition-none", !isCollapsed && "rotate-90")}
              strokeWidth={2.25}
            />
          </span>
          <span className="min-w-0">{title}</span>
        </button>
      </Heading>
      {!isCollapsed && children}
    </section>
  );
}

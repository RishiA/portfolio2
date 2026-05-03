"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { useWorkFilterViewTransition } from "@/lib/use-work-filter-view-transition";
import { workHref, type WorkFiltersUi } from "@/lib/work-filter-href";

export interface WorkFiltersToolbarProps {
  tags: readonly string[];
  periods: readonly string[];
  currentTag: string;
  currentPeriod: string;
  resultCount: number;
  ui: WorkFiltersUi;
}

function focusAdjacentLink(container: HTMLElement, selector: string, delta: number) {
  const links = [...container.querySelectorAll<HTMLAnchorElement>(selector)];
  if (!links.length) return;
  const active = document.activeElement;
  const i = links.indexOf(active as HTMLAnchorElement);
  if (i === -1) return;
  const next = (i + delta + links.length) % links.length;
  links[next]?.focus();
}

export function WorkFiltersToolbar({
  tags,
  periods,
  currentTag,
  currentPeriod,
  resultCount,
  ui
}: WorkFiltersToolbarProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  useWorkFilterViewTransition(rootRef, router);

  const onChipRailKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAdjacentLink(e.currentTarget, "a.work-domain-chip", 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAdjacentLink(e.currentTarget, "a.work-domain-chip", -1);
    }
  }, []);

  const onSegmentKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAdjacentLink(e.currentTarget, "a.work-segment", 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAdjacentLink(e.currentTarget, "a.work-segment", -1);
    }
  }, []);

  const roleLabel =
    resultCount === 1 ? "1 role matches your filters." : `${resultCount} roles match your filters.`;

  return (
    <div ref={rootRef} className="work-filter-surface" id="work-filter-toolbar">
      <nav className="work-filter-nav" aria-label="Filter work history">
        <div className="work-filter-block">
          <div className="work-filter-block-head">
            <span className="work-filter-heading" id="work-filter-domain-label">
              Domain
            </span>
            <span className="work-filter-hint" aria-hidden="true">
              Scroll · ← →
            </span>
          </div>
          <ul
            className="work-chip-rail"
            aria-labelledby="work-filter-domain-label"
            onKeyDown={onChipRailKeyDown}
          >
            <li>
              <Link className={`work-domain-chip ${currentTag === "all" ? "is-active" : ""}`} href={workHref("all", currentPeriod, ui)}>
                All
              </Link>
            </li>
            {tags.map((tag) => (
              <li key={tag}>
                <Link className={`work-domain-chip ${currentTag === tag ? "is-active" : ""}`} href={workHref(tag, currentPeriod, ui)}>
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="work-filter-block">
          <span className="work-filter-heading" id="work-filter-period-label">
            Period
          </span>
          <ul
            className="work-segment-group"
            aria-labelledby="work-filter-period-label"
            onKeyDown={onSegmentKeyDown}
          >
            <li>
              <Link className={`work-segment ${currentPeriod === "all" ? "is-active" : ""}`} href={workHref(currentTag, "all", ui)}>
                All
              </Link>
            </li>
            {periods.map((period) => (
              <li key={period}>
                <Link className={`work-segment ${currentPeriod === period ? "is-active" : ""}`} href={workHref(currentTag, period, ui)}>
                  {period}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <p className="work-filter-meta" role="status">
        <span className="visually-hidden">{roleLabel}</span>
        <span aria-hidden="true">
          {resultCount} {resultCount === 1 ? "role" : "roles"}
        </span>
      </p>
    </div>
  );
}

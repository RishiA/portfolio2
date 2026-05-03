"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useWorkFilterViewTransition } from "@/lib/use-work-filter-view-transition";
import { workHref, type WorkFiltersUi } from "@/lib/work-filter-href";

export interface WorkFiltersMinimalProps {
  tags: readonly string[];
  periods: readonly string[];
  currentTag: string;
  currentPeriod: string;
  resultCount: number;
  ui: WorkFiltersUi;
}

export function WorkFiltersMinimal({
  tags,
  periods,
  currentTag,
  currentPeriod,
  resultCount,
  ui
}: WorkFiltersMinimalProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  useWorkFilterViewTransition(rootRef, router);

  const roleLabel =
    resultCount === 1 ? "1 role matches your filters." : `${resultCount} roles match your filters.`;

  return (
    <div ref={rootRef} className="work-filter-surface work-filter-surface--minimal" id="work-filter-toolbar">
      <nav className="work-filter-nav" aria-label="Filter work history">
        <div className="section-header work-filter-minimal-block">
          <p className="work-filter-heading work-filter-heading--inline">Domain</p>
          <div className="filter-row">
            <Link className={`filter-chip ${currentTag === "all" ? "is-active" : ""}`} href={workHref("all", currentPeriod, ui)}>
              All
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag}
                className={`filter-chip ${currentTag === tag ? "is-active" : ""}`}
                href={workHref(tag, currentPeriod, ui)}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
        <div className="section-header work-filter-minimal-block">
          <p className="work-filter-heading work-filter-heading--inline">Period</p>
          <div className="filter-row">
            <Link className={`filter-chip ${currentPeriod === "all" ? "is-active" : ""}`} href={workHref(currentTag, "all", ui)}>
              All
            </Link>
            {periods.map((period) => (
              <Link
                key={period}
                className={`filter-chip ${currentPeriod === period ? "is-active" : ""}`}
                href={workHref(currentTag, period, ui)}
              >
                {period}
              </Link>
            ))}
          </div>
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

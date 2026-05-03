"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useWorkFilterViewTransition } from "@/lib/use-work-filter-view-transition";
import { workHref, type WorkFiltersUi } from "@/lib/work-filter-href";

export interface WorkFiltersFacetsProps {
  tags: readonly string[];
  periods: readonly string[];
  currentTag: string;
  currentPeriod: string;
  resultCount: number;
  ui: WorkFiltersUi;
  tagCounts: Readonly<Record<string, number>>;
  periodCounts: Readonly<Record<string, number>>;
}

export function WorkFiltersFacets({
  tags,
  periods,
  currentTag,
  currentPeriod,
  resultCount,
  ui,
  tagCounts,
  periodCounts
}: WorkFiltersFacetsProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [domainQuery, setDomainQuery] = useState("");
  useWorkFilterViewTransition(rootRef, router);

  const filteredTags = useMemo(() => {
    const q = domainQuery.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.toLowerCase().includes(q));
  }, [tags, domainQuery]);

  const roleLabel =
    resultCount === 1 ? "1 role matches your filters." : `${resultCount} roles match your filters.`;

  const hasActiveFilters = currentTag !== "all" || currentPeriod !== "all";

  return (
    <div ref={rootRef} className="work-filter-surface work-filter-surface--facets" id="work-filter-toolbar">
      <div className="work-filter-facets-row" role="presentation">
        <details className="work-filter-details">
          <summary className="work-filter-details-summary">
            <span className="work-filter-details-label">Domain</span>
            <span className="work-filter-details-value">{currentTag === "all" ? "All" : currentTag}</span>
          </summary>
          <div className="work-filter-details-panel">
            <label className="work-filter-facet-search-label" htmlFor="work-facet-domain-q">
              Filter domains
            </label>
            <input
              id="work-facet-domain-q"
              type="search"
              className="work-filter-facet-search"
              placeholder="Search domains…"
              value={domainQuery}
              onChange={(e) => setDomainQuery(e.target.value)}
              autoComplete="off"
            />
            <ul className="work-filter-facet-list">
              <li>
                <Link className={currentTag === "all" ? "is-active" : ""} href={workHref("all", currentPeriod, ui)}>
                  All
                </Link>
              </li>
              {filteredTags.map((tag) => (
                <li key={tag}>
                  <Link className={currentTag === tag ? "is-active" : ""} href={workHref(tag, currentPeriod, ui)}>
                    <span>{tag}</span>
                    <span className="work-filter-facet-count">{tagCounts[tag] ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {filteredTags.length === 0 ? <p className="work-filter-facet-empty">No matching domains.</p> : null}
          </div>
        </details>

        <details className="work-filter-details">
          <summary className="work-filter-details-summary">
            <span className="work-filter-details-label">Period</span>
            <span className="work-filter-details-value">{currentPeriod === "all" ? "All" : currentPeriod}</span>
          </summary>
          <div className="work-filter-details-panel">
            <ul className="work-filter-facet-list">
              <li>
                <Link className={currentPeriod === "all" ? "is-active" : ""} href={workHref(currentTag, "all", ui)}>
                  All
                </Link>
              </li>
              {periods.map((period) => (
                <li key={period}>
                  <Link
                    className={currentPeriod === period ? "is-active" : ""}
                    href={workHref(currentTag, period, ui)}
                  >
                    <span>{period}</span>
                    <span className="work-filter-facet-count">{periodCounts[period] ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>

      <div className="work-filter-facets-footer">
        {hasActiveFilters ? (
          <Link className="work-filter-clear" href={workHref("all", "all", ui)}>
            Clear filters
          </Link>
        ) : (
          <span className="work-filter-clear-spacer" />
        )}
        <p className="work-filter-meta work-filter-meta--inline" role="status">
          <span className="visually-hidden">{roleLabel}</span>
          <span aria-hidden="true">
            {resultCount} {resultCount === 1 ? "role" : "roles"}
          </span>
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { CSSProperties } from "react";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { WorkCard } from "@/components/work-card";
import { WorkFiltersShell } from "@/components/work-filters-shell";
import { workItems } from "@/content/work";
import { parseWorkFiltersUi, workHref, type WorkFiltersUi } from "@/lib/work-filter-href";
import { sortWorkPeriodLabels } from "@/lib/sort-work-periods";
import type { WorkItem } from "@/types/content";

export const metadata = {
  title: "Proof of Work"
};

const allTags = Array.from(new Set(workItems.flatMap((item) => item.tags))).sort();
const allPeriodLabels = Array.from(new Set(workItems.map((item) => item.periodLabel)));
const allPeriods = sortWorkPeriodLabels(allPeriodLabels);

const tagCounts = Object.fromEntries(
  allTags.map((tag) => [tag, workItems.filter((item) => item.tags.includes(tag)).length])
);
const periodCounts = Object.fromEntries(
  allPeriodLabels.map((period) => [period, workItems.filter((item) => item.periodLabel === period).length])
);

const sortedAllWork = [...workItems].sort((a, b) => a.sortOrder - b.sortOrder);

interface WorkPageProps {
  searchParams?: Promise<{ tag?: string; period?: string; ui?: string }>;
}

function renderWorkList(ui: WorkFiltersUi, entries: WorkItem[]) {
  if (ui === "timeline") {
    return (
      <ol className="work-timeline" aria-label="Work history">
        {entries.map((item) => (
          <li key={item.slug} className="work-timeline-item">
            <WorkCard item={item} />
          </li>
        ))}
      </ol>
    );
  }

  if (ui === "filterless") {
    return (
      <div className="work-list">
        {entries.map((item) => (
          <WorkCard key={item.slug} item={item} />
        ))}
      </div>
    );
  }

  if (ui === "transitions") {
    return (
      <div className="work-list work-list--stagger">
        {entries.map((item, index) => (
          <div
            key={item.slug}
            className="work-list-stagger-item"
            style={{ "--work-entry-i": index } as CSSProperties}
          >
            <WorkCard item={item} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="work-list">
      {entries.map((item, index) => (
        <div
          key={item.slug}
          className="work-list-stagger-item"
          style={{ "--work-entry-i": index } as CSSProperties}
        >
          <WorkCard item={item} />
        </div>
      ))}
    </div>
  );
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const params = (await searchParams) ?? {};
  const currentTag = params.tag || "all";
  const currentPeriod = params.period || "all";
  const ui = parseWorkFiltersUi(params.ui);

  const useFullList = ui === "timeline" || ui === "filterless";
  const entries = useFullList
    ? sortedAllWork
    : workItems
        .filter((item) => (currentTag === "all" ? true : item.tags.includes(currentTag)))
        .filter((item) => (currentPeriod === "all" ? true : item.periodLabel === currentPeriod))
        .sort((a, b) => a.sortOrder - b.sortOrder);

  const switchHref = (mode: WorkFiltersUi) =>
    mode === "timeline" || mode === "filterless"
      ? workHref("all", "all", mode)
      : workHref(currentTag, currentPeriod, mode);

  return (
    <Container>
      <Section
        title="Proof of Work"
        subtitle="What I've shipped, company by company."
      >
        <nav className="work-filter-ui-switcher" aria-label="Filter interaction layout">
          <span className="work-filter-ui-switcher-label">Interaction</span>
          <div className="work-filter-ui-switcher-links">
            <Link
              className={`work-filter-ui-link ${ui === "segments" ? "is-active" : ""}`}
              href={switchHref("segments")}
            >
              Segments
            </Link>
            <span className="work-filter-ui-sep" aria-hidden="true">
              ·
            </span>
            <Link
              className={`work-filter-ui-link ${ui === "facets" ? "is-active" : ""}`}
              href={switchHref("facets")}
            >
              Facets
            </Link>
            <span className="work-filter-ui-sep" aria-hidden="true">
              ·
            </span>
            <Link
              className={`work-filter-ui-link ${ui === "transitions" ? "is-active" : ""}`}
              href={switchHref("transitions")}
            >
              Transitions
            </Link>
            <span className="work-filter-ui-sep" aria-hidden="true">
              ·
            </span>
            <Link
              className={`work-filter-ui-link ${ui === "timeline" ? "is-active" : ""}`}
              href={switchHref("timeline")}
            >
              Timeline
            </Link>
            <span className="work-filter-ui-sep" aria-hidden="true">
              ·
            </span>
            <Link
              className={`work-filter-ui-link ${ui === "filterless" ? "is-active" : ""}`}
              href={switchHref("filterless")}
            >
              Filterless
            </Link>
          </div>
        </nav>

        <WorkFiltersShell
          ui={ui}
          tags={allTags}
          periods={allPeriods}
          currentTag={currentTag}
          currentPeriod={currentPeriod}
          resultCount={entries.length}
          tagCounts={tagCounts}
          periodCounts={periodCounts}
        />

        {renderWorkList(ui, entries)}
      </Section>
    </Container>
  );
}

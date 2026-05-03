import Link from "next/link";
import type { CSSProperties } from "react";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { WorkCard } from "@/components/work-card";
import { WorkFiltersShell } from "@/components/work-filters-shell";
import { workItems } from "@/content/work";
import { parseWorkFiltersUi, workHref } from "@/lib/work-filter-href";
import { sortWorkPeriodLabels } from "@/lib/sort-work-periods";

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

interface WorkPageProps {
  searchParams?: Promise<{ tag?: string; period?: string; ui?: string }>;
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const params = (await searchParams) ?? {};
  const currentTag = params.tag || "all";
  const currentPeriod = params.period || "all";
  const ui = parseWorkFiltersUi(params.ui);

  const filtered = workItems
    .filter((item) => (currentTag === "all" ? true : item.tags.includes(currentTag)))
    .filter((item) => (currentPeriod === "all" ? true : item.periodLabel === currentPeriod))
    .sort((a, b) => a.sortOrder - b.sortOrder);

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
              href={workHref(currentTag, currentPeriod, "segments")}
            >
              Segments
            </Link>
            <span className="work-filter-ui-sep" aria-hidden="true">
              ·
            </span>
            <Link
              className={`work-filter-ui-link ${ui === "facets" ? "is-active" : ""}`}
              href={workHref(currentTag, currentPeriod, "facets")}
            >
              Facets
            </Link>
            <span className="work-filter-ui-sep" aria-hidden="true">
              ·
            </span>
            <Link
              className={`work-filter-ui-link ${ui === "transitions" ? "is-active" : ""}`}
              href={workHref(currentTag, currentPeriod, "transitions")}
            >
              Transitions
            </Link>
          </div>
        </nav>

        <WorkFiltersShell
          ui={ui}
          tags={allTags}
          periods={allPeriods}
          currentTag={currentTag}
          currentPeriod={currentPeriod}
          resultCount={filtered.length}
          tagCounts={tagCounts}
          periodCounts={periodCounts}
        />

        <div className={ui === "transitions" ? "work-list work-list--stagger" : "work-list"}>
          {filtered.map((item, index) => (
            <div
              key={item.slug}
              className="work-list-stagger-item"
              style={{ "--work-entry-i": index } as CSSProperties}
            >
              <WorkCard item={item} />
            </div>
          ))}
        </div>
      </Section>
    </Container>
  );
}

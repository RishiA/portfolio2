"use client";

import type { WorkFiltersUi } from "@/lib/work-filter-href";
import { WorkFiltersFacets } from "@/components/work-filters-facets";
import { WorkFiltersMinimal } from "@/components/work-filters-minimal";
import { WorkFiltersToolbar } from "@/components/work-filters-toolbar";

export interface WorkFiltersShellProps {
  ui: WorkFiltersUi;
  tags: readonly string[];
  periods: readonly string[];
  currentTag: string;
  currentPeriod: string;
  resultCount: number;
  tagCounts: Readonly<Record<string, number>>;
  periodCounts: Readonly<Record<string, number>>;
}

export function WorkFiltersShell(props: WorkFiltersShellProps) {
  if (props.ui === "timeline" || props.ui === "filterless") {
    return null;
  }
  if (props.ui === "facets") {
    return <WorkFiltersFacets {...props} />;
  }
  if (props.ui === "transitions") {
    return (
      <WorkFiltersMinimal
        ui={props.ui}
        tags={props.tags}
        periods={props.periods}
        currentTag={props.currentTag}
        currentPeriod={props.currentPeriod}
        resultCount={props.resultCount}
      />
    );
  }
  return (
    <WorkFiltersToolbar
      ui={props.ui}
      tags={props.tags}
      periods={props.periods}
      currentTag={props.currentTag}
      currentPeriod={props.currentPeriod}
      resultCount={props.resultCount}
    />
  );
}

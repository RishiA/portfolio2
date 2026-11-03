// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
export const DOCK_SHOW_OPEN_INDICATORS_STORAGE_KEY = "dock-show-open-indicators";

export function parseShowDockIndicators(value: string | null): boolean {
  return value !== "false";
}

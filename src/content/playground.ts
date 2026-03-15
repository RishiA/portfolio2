import type { PlaygroundItem } from "@/types/content";

export const playgroundItems: PlaygroundItem[] = [
  {
    slug: "burnrate-calculator",
    name: "Burnrate",
    oneLiner: "Quick scenario modeling for startup runway and burn rate.",
    status: "live",
    stack: ["TypeScript", "React", "Data Viz"],
    repoUrl: "https://github.com/rishi-rho/burnrate",
    liveUrl: "https://rishiathanikar.com/",
    lastUpdated: "2026-01-30"
  },
  {
    slug: "transaction-layers",
    name: "Card Layer Cake",
    oneLiner: "Interactive layer-based exploration for card transaction enrichment.",
    status: "wip",
    stack: ["TypeScript", "UX Prototype"],
    repoUrl: "https://github.com/rishi-rho/card-layer-cake",
    lastUpdated: "2026-02-02"
  },
  {
    slug: "zoom-recorder-reminder",
    name: "Zoom Recording Reminder",
    oneLiner: "Desktop reminder helper to avoid missed meeting recordings.",
    status: "archived",
    stack: ["Swift", "macOS"],
    repoUrl: "https://github.com/rishi-rho/zoom-recording-reminder",
    lastUpdated: "2026-02-08"
  }
];

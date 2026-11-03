import type { NoteDetail, NoteListItem } from "@/lib/profile/types";
import type { PlaygroundItem, WorkItem } from "@/types/content";
import { makeNote, makePost, para } from "./profile-fixtures";

export const item = (overrides: Partial<NoteListItem> & { slug: string }): NoteListItem => ({
  kind: "note",
  title: overrides.slug,
  excerpt: "An excerpt.",
  collection: "notes",
  url: `/v2/notes/${overrides.slug}`,
  ...overrides
});

export const fixtureItems: NoteListItem[] = [
  item({ slug: "about-me", kind: "about", title: "About me", emoji: "\u{1F44B}", pinRank: 0, collection: null }),
  item({ slug: "rho", kind: "work", title: "Rho", excerpt: "Payments infrastructure.", collection: "work" }),
  item({ slug: "agent-demo", kind: "project", title: "Agent demo", excerpt: "A small agent.", collection: "playground", date: "2026-10-30T15:00:00.000Z" }),
  item({ slug: "on-money", kind: "post", title: "On money", excerpt: "Notes about rho and ledgers.", collection: "writing", date: "2026-10-01T15:00:00.000Z" }),
  item({ slug: "a-link", title: "A link", collection: "notes", date: "2026-01-05T15:00:00.000Z" })
];

export const workItem: WorkItem = {
  slug: "rho",
  organization: "Rho",
  roleTitle: "Product Manager",
  periodLabel: "2023 - Present",
  location: "New York",
  summary: "Payments infrastructure.",
  highlights: ["Shipped the API"],
  problem: "Money moved slowly.",
  approach: "Built a ledger.",
  outcome: "Transfers settle faster.",
  impactMetrics: [{ label: "Latency", value: "-40%" }],
  artifacts: [{ label: "Write-up", url: "https://example.com/rho", type: "doc" }],
  tags: ["payments"],
  featured: true,
  sortOrder: 1
};

export const projectItem: PlaygroundItem = {
  slug: "agent-demo",
  name: "Agent demo",
  oneLiner: "A small agent.",
  status: "live",
  stack: ["TypeScript", "Next.js"],
  liveUrl: "https://example.com/demo",
  repoUrl: "https://github.com/example/agent"
};

const detailItem = (slug: string, kind: NoteListItem["kind"], overrides: Partial<NoteListItem> = {}) =>
  item({ slug, kind, title: slug, ...overrides });

export const aboutDetail: NoteDetail = {
  kind: "about",
  item: detailItem("about-me", "about", { title: "About me" }),
  profile: {
    name: "Rishi",
    headline: "A product manager.",
    location: "New York",
    bio: ["First paragraph.", "Second paragraph."],
    links: [{ id: "github", label: "GitHub", href: "https://github.com/example" }]
  }
};

export const workDetail: NoteDetail = { kind: "work", item: detailItem("rho", "work"), source: workItem };
export const projectDetail: NoteDetail = { kind: "project", item: detailItem("agent-demo", "project"), source: projectItem };

export const noteDetail: NoteDetail = {
  kind: "note",
  item: detailItem("a-link", "note", { date: "2026-05-14T21:33:00.000Z" }),
  source: makeNote({
    slug: "a-link",
    body: [
      { _type: "block", style: "normal", markDefs: [{ _key: "l1", _type: "link", href: "/v2/notes/rho" }], children: [{ _type: "span", text: "See ", marks: [] }, { _type: "span", text: "Rho", marks: ["l1"] }] },
      { _type: "block", style: "h2", children: [{ _type: "span", text: "Details" }] },
      ...para("Below the heading.")
    ]
  })
};

export const postDetail: NoteDetail = {
  kind: "post",
  item: detailItem("on-money", "post", { date: "2026-10-01T15:00:00.000Z" }),
  source: makePost({ slug: "on-money", readingTimeMinutes: 4, body: para("Post body text.") })
};

export const landingWorkDetail: NoteDetail = {
  kind: "landing",
  item: detailItem("proof-of-work", "landing"),
  landing: { id: "proof-of-work", work: [workItem] }
};

export const landingPlaygroundDetail: NoteDetail = {
  kind: "landing",
  item: detailItem("playground", "landing"),
  landing: { id: "playground", projects: [projectItem] }
};

export const landingLinksDetail: NoteDetail = {
  kind: "landing",
  item: detailItem("quick-links", "landing"),
  landing: {
    id: "quick-links",
    links: [
      { kind: "profile", label: "LinkedIn", href: "https://linkedin.com/in/example" },
      { kind: "resume", label: "Resume", href: "/Resume" },
      { kind: "note", label: "About me", href: "/v2/notes/about-me" }
    ]
  }
};

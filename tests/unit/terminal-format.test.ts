import { describe, expect, it } from "vitest";
import {
  formatContact,
  formatExperience,
  formatProjects,
  formatProfile,
  formatRecent,
  formatResponse,
  formatSearch,
  formatWork,
  safeHref,
  summarize
} from "@/lib/terminal/format";
import type { WorkItem } from "@/types/content";

const experience = [
  {
    organization: "Rho",
    roleTitle: "Product Lead",
    periodLabel: "2023 to now",
    summary: "Built things.",
    workSlug: "rho",
    sortOrder: 1,
    url: "/v2/notes/rho"
  }
];

const work = {
  slug: "rho",
  organization: "Rho",
  roleTitle: "Product Lead",
  periodLabel: "2023 to now",
  location: "New York",
  summary: "Built things.",
  highlights: ["Shipped A", "Shipped B"],
  tags: ["fintech", "b2b"],
  featured: true,
  sortOrder: 1,
  url: "/v2/notes/rho"
} as WorkItem & { url: string };

describe("safeHref", () => {
  it("allows site paths and http(s) only", () => {
    expect(safeHref("/v2/notes/x")).toBe("/v2/notes/x");
    expect(safeHref("https://a.test")).toBe("https://a.test");
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("//evil.test")).toBeUndefined();
    expect(safeHref("data:text/html,x")).toBeUndefined();
    expect(safeHref(undefined)).toBeUndefined();
  });
});

describe("formatters", () => {
  it("profile", () => {
    const blocks = formatProfile({
      name: "Rishi",
      headline: "PM",
      location: "NYC",
      bio: ["One.", "Two."],
      links: [{ id: "github", label: "GitHub", href: "https://github.com/x" }]
    });
    expect(blocks[0]).toEqual({ type: "heading", text: "Rishi" });
    expect(blocks.filter((block) => block.type === "text")).toHaveLength(3);
    expect(blocks[blocks.length - 1]).toEqual({
      type: "rows",
      rows: [
        { key: "Location", value: "NYC" },
        { key: "GitHub", value: "https://github.com/x", href: "https://github.com/x" }
      ]
    });
  });

  it("experience links each role to its url", () => {
    expect(formatExperience(experience)).toEqual([
      {
        type: "list",
        items: [{ title: "Rho", meta: "Product Lead · 2023 to now", detail: "Built things.", href: "/v2/notes/rho" }]
      }
    ]);
    expect(formatExperience([])).toEqual([{ type: "text", text: "No roles to show." }]);
  });

  it("work", () => {
    const blocks = formatWork(work);
    expect(blocks[0]).toEqual({ type: "heading", text: "Rho, Product Lead" });
    expect(blocks).toContainEqual({ type: "list", items: [{ title: "Shipped A" }, { title: "Shipped B" }] });
    expect(blocks[blocks.length - 1]).toEqual({ type: "list", items: [{ title: "Read the full note", href: "/v2/notes/rho" }] });
  });

  it("recent and search", () => {
    const recent = formatRecent([
      { slug: "a", kind: "note", title: "A", excerpt: "ex", emoji: "x", date: "2026-03-01T00:00:00Z", collection: "notes", url: "/v2/notes/a" }
    ]);
    expect(recent).toEqual([
      { type: "list", items: [{ title: "x A", meta: "note · 2026-03-01", detail: "ex", href: "/v2/notes/a" }] }
    ]);
    expect(formatRecent([])).toEqual([{ type: "text", text: "Nothing here yet." }]);
    expect(formatSearch([{ slug: "a", kind: "work", title: "A", snippet: "sn", url: "/v2/notes/a" }])).toEqual([
      { type: "list", items: [{ title: "A", meta: "work", detail: "sn", href: "/v2/notes/a" }] }
    ]);
    expect(formatSearch([])).toEqual([{ type: "text", text: "No results." }]);
  });

  it("projects", () => {
    expect(
      formatProjects([{ slug: "p", name: "P", oneLiner: "does p", status: "live", stack: ["ts", "react"], url: "/v2/notes/p" }])
    ).toEqual([{ type: "list", items: [{ title: "P", meta: "live · ts, react", detail: "does p", href: "/v2/notes/p" }] }]);
  });

  it("contact drops unsafe links", () => {
    expect(
      formatContact([
        { id: "x", label: "X", href: "javascript:alert(1)" },
        { id: "github", label: "GitHub", href: "https://github.com/x" }
      ])
    ).toEqual([
      {
        type: "rows",
        rows: [
          { key: "X", value: "javascript:alert(1)", href: undefined },
          { key: "GitHub", value: "https://github.com/x", href: "https://github.com/x" }
        ]
      }
    ]);
  });

  it("formatResponse dispatches by command and summarize counts results", () => {
    const blocks = formatResponse("experience", experience);
    expect(blocks).not.toBeNull();
    expect(summarize("experience", blocks ?? [])).toBe("Loaded 1 result");
    expect(summarize("profile", [{ type: "text", text: "x" }])).toBe("Loaded /profile");
    expect(formatResponse("help", [])).toBeNull();
  });
});

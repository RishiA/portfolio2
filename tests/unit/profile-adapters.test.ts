import { describe, expect, it } from "vitest";
import { publicLinks } from "@/content/about";
import { workItems } from "@/content/work";
import {
  assertUniqueSlugs,
  buildContact,
  buildExperience,
  buildLandingItems,
  buildProfile,
  buildQuickLinks,
  noteToListItem,
  postToListItem,
  projectToListItem,
  workToListItem
} from "@/lib/profile/adapters";
import { makeExcerpt, toPlainText } from "@/lib/profile/text";
import type { WorkItem } from "@/types/content";
import { makeNote, makePost, para } from "./profile-fixtures";

describe("profile adapters", () => {
  it("builds the profile and contact from the shared about content, without email", () => {
    const profile = buildProfile();
    expect(profile.name).toBe("Rishi Athanikar");
    expect(profile.bio).toHaveLength(5);
    expect(profile.bio[1]).toContain("I'm also the kind of PM who ships code.");
    expect(buildContact().map((link) => link.id)).toEqual(["linkedin", "github", "x"]);
    expect(buildContact()).toEqual(publicLinks.map((link) => ({ ...link })));
    expect(JSON.stringify(buildContact())).not.toMatch(/mailto|@.*\./);
  });

  it("defines four landing notes with pin ranks 0 to 3", () => {
    const landing = buildLandingItems();
    expect(landing.map((item) => [item.slug, item.kind, item.pinRank])).toEqual([
      ["about-me", "about", 0],
      ["proof-of-work", "landing", 1],
      ["playground", "landing", 2],
      ["quick-links", "landing", 3]
    ]);
    expect(landing.every((item) => item.collection === null && item.emoji && !item.date)).toBe(true);
    expect(landing[0].title).toBe("About me");
    expect(landing[0].url).toBe("/v2/notes/about-me");
  });

  it("quick links include profiles, the resume and the other landing notes", () => {
    const links = buildQuickLinks();
    expect(links.find((link) => link.kind === "resume")?.href).toBe("/Resume");
    expect(links.filter((link) => link.kind === "profile")).toHaveLength(3);
    expect(links.filter((link) => link.kind === "note").map((link) => link.href)).toEqual([
      "/v2/notes/about-me",
      "/v2/notes/proof-of-work",
      "/v2/notes/playground"
    ]);
  });

  it("adapts work items with a collection, url and no date", () => {
    const item = workToListItem(workItems[0]);
    expect(item).toMatchObject({ slug: "rho", kind: "work", collection: "work", url: "/v2/notes/rho" });
    expect(item.date).toBeUndefined();
    expect(item.excerpt.length).toBeLessThanOrEqual(160);
  });

  it("adapts projects using lastUpdated as an ISO date and oneLiner as excerpt", () => {
    const item = projectToListItem({
      slug: "p",
      name: "Proj",
      oneLiner: "Does a thing.",
      status: "live",
      stack: ["TS"],
      lastUpdated: "2026-01-30"
    });
    expect(item).toMatchObject({
      kind: "project",
      title: "Proj",
      excerpt: "Does a thing.",
      date: "2026-01-30T00:00:00.000Z",
      collection: "playground"
    });
  });

  it("adapts notes and posts with publishedAt and collections", () => {
    const note = noteToListItem(makeNote({ slug: "n", emoji: "x", publishedAt: "2026-04-01T10:00:00Z" }));
    expect(note).toMatchObject({ kind: "note", collection: "notes", emoji: "x", date: "2026-04-01T10:00:00.000Z" });
    const post = postToListItem(makePost({ slug: "po", excerpt: "Excerpt wins." }));
    expect(post).toMatchObject({ kind: "post", collection: "writing", excerpt: "Excerpt wins." });
  });

  describe("title fallback", () => {
    it("uses the explicit title first", () => {
      const note = makeNote({
        slug: "a",
        kind: "link",
        title: "Mine",
        sourceUrl: "https://www.example.com/x",
        linkPreview: { url: "https://www.example.com/x", title: "Preview" }
      });
      expect(noteToListItem(note).title).toBe("Mine");
    });

    it("falls back to the link preview title", () => {
      const note = makeNote({
        slug: "a",
        kind: "link",
        title: undefined,
        sourceUrl: "https://www.example.com/x",
        linkPreview: { url: "https://www.example.com/x", title: "Preview" }
      });
      expect(noteToListItem(note).title).toBe("Preview");
    });

    it("falls back to the URL hostname", () => {
      const note = makeNote({ slug: "a", kind: "link", title: undefined, sourceUrl: "https://www.example.com/x" });
      expect(noteToListItem(note).title).toBe("example.com");
    });

    it("uses the start of the body for untitled text notes", () => {
      const note = makeNote({ slug: "a", title: undefined, body: para("Quick thought about pricing.") });
      expect(noteToListItem(note).title).toBe("Quick thought about pricing.");
    });
  });

  describe("excerpts", () => {
    it("truncates at 160 characters with an ellipsis", () => {
      const long = "word ".repeat(100);
      const excerpt = makeExcerpt(long);
      expect(excerpt.length).toBeLessThanOrEqual(160);
      expect(excerpt.endsWith("…")).toBe(true);
    });

    it("leaves short text alone and collapses whitespace", () => {
      expect(makeExcerpt("  a \n\n b  ")).toBe("a b");
    });

    it("strips markup", () => {
      const text = toPlainText("<script>alert(1)</script>Hello <b>world</b> 2 < 3");
      expect(text).not.toMatch(/[<>]/);
      expect(text).toContain("Hello world");
    });

    it("builds note excerpts from portable text, skipping embeds", () => {
      const note = makeNote({
        slug: "e",
        body: [
          { _type: "linkEmbed", url: "https://example.com", displayAs: "card" },
          ...para("First <i>line</i>."),
          ...para("Second line.")
        ]
      });
      expect(noteToListItem(note).excerpt).toBe("First line. Second line.");
    });

    it("falls back to the link preview description for link notes with no body", () => {
      const note = makeNote({
        slug: "e",
        kind: "link",
        body: [],
        linkPreview: { url: "https://example.com", description: "Preview description" }
      });
      expect(noteToListItem(note).excerpt).toBe("Preview description");
    });
  });

  describe("assertUniqueSlugs", () => {
    it("passes for unique slugs", () => {
      expect(() => assertUniqueSlugs([{ slug: "a" }, { slug: "b" }])).not.toThrow();
    });

    it("throws naming every duplicate", () => {
      expect(() => assertUniqueSlugs([{ slug: "b" }, { slug: "a" }, { slug: "b" }, { slug: "a" }, { slug: "c" }])).toThrow(
        /Duplicate note slugs.*a, b/
      );
    });
  });

  describe("experience order", () => {
    const work = (slug: string, periodLabel: string, sortOrder: number): WorkItem => ({
      slug,
      organization: slug,
      roleTitle: "PM",
      periodLabel,
      summary: "s",
      highlights: [],
      tags: [],
      featured: false,
      sortOrder
    });

    it("puts Present first, then newer start years, then sortOrder for ties", () => {
      const result = buildExperience([
        work("old", "2011-2017", 7),
        work("b", "2019-2021", 5),
        work("now", "Present", 9),
        work("a", "2019-2021", 4),
        work("mid", "2023-2025", 1)
      ]);
      expect(result.map((entry) => entry.workSlug)).toEqual(["now", "mid", "a", "b", "old"]);
    });

    it("maps real work items to Experience entries", () => {
      const result = buildExperience(workItems);
      expect(result[0]).toMatchObject({ organization: "Rho", workSlug: "rho", periodLabel: "Present" });
      expect(result).toHaveLength(workItems.length);
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sanity/loaders", () => ({
  getNotes: vi.fn(),
  getBlogPosts: vi.fn()
}));

import { getBlogPosts, getNotes } from "@/lib/sanity/loaders";
import {
  getContact,
  getExperience,
  getNoteDetail,
  getNoteList,
  getProfile,
  getProjects,
  getRecent,
  getWorkItem
} from "@/lib/profile";
import { makeNote, makePost } from "./profile-fixtures";

const setSources = (notes = [] as ReturnType<typeof makeNote>[], posts = [] as ReturnType<typeof makePost>[]) => {
  vi.mocked(getNotes).mockResolvedValue(notes);
  vi.mocked(getBlogPosts).mockResolvedValue(posts);
};

beforeEach(() => {
  setSources();
});

describe("getNoteList", () => {
  it("pins the four landing notes in order, then pinned Sanity notes newest first", async () => {
    setSources([
      makeNote({ slug: "old-pin", pinned: true, publishedAt: "2026-01-01T00:00:00Z" }),
      makeNote({ slug: "plain", publishedAt: "2026-05-01T00:00:00Z" }),
      makeNote({ slug: "new-pin", pinned: true, publishedAt: "2026-04-01T00:00:00Z" })
    ]);
    const list = await getNoteList();
    expect(list.slice(0, 6).map((item) => item.slug)).toEqual([
      "about-me",
      "proof-of-work",
      "playground",
      "quick-links",
      "new-pin",
      "old-pin"
    ]);
    expect(list.slice(0, 6).map((item) => item.pinRank)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(list.find((item) => item.slug === "plain")?.pinRank).toBeUndefined();
  });

  it("orders the rest by date desc, with undated work items last in experience order", async () => {
    setSources(
      [makeNote({ slug: "note", publishedAt: "2026-05-01T00:00:00Z" })],
      [makePost({ slug: "post", publishedAt: "2026-06-01T00:00:00Z" })]
    );
    const rest = (await getNoteList()).filter((item) => item.pinRank === undefined);
    expect(rest[0].slug).toBe("post");
    expect(rest[1].slug).toBe("note");
    const firstWork = rest.findIndex((item) => item.kind === "work");
    expect(rest.slice(firstWork).every((item) => item.kind === "work")).toBe(true);
    expect(rest[firstWork].slug).toBe("rho");
  });

  it("omits unpublished notes and posts", async () => {
    setSources([makeNote({ slug: "draft", isPublished: false })], [makePost({ slug: "draft-post", isPublished: false })]);
    const slugs = (await getNoteList()).map((item) => item.slug);
    expect(slugs).not.toContain("draft");
    expect(slugs).not.toContain("draft-post");
  });

  it("fails when a Sanity slug collides with another source", async () => {
    setSources([makeNote({ slug: "rho" })]);
    await expect(getNoteList()).rejects.toThrow(/Duplicate note slugs.*rho/);
  });

  it("fails when a note collides with a landing slug", async () => {
    setSources([makeNote({ slug: "about-me" })]);
    await expect(getNoteList()).rejects.toThrow(/about-me/);
  });

  it("fails when a post and note share a slug", async () => {
    setSources([makeNote({ slug: "same" })], [makePost({ slug: "same" })]);
    await expect(getNoteList()).rejects.toThrow(/same/);
  });
});

describe("getRecent", () => {
  it("returns notes, posts and projects newest first and excludes work and landing notes", async () => {
    setSources(
      [makeNote({ slug: "n1", publishedAt: "2026-12-01T00:00:00Z" }), makeNote({ slug: "n0", publishedAt: "2025-01-01T00:00:00Z" })],
      [makePost({ slug: "p1", publishedAt: "2026-12-15T00:00:00Z" })]
    );
    const recent = await getRecent(50);
    expect(recent.slice(0, 2).map((item) => item.slug)).toEqual(["p1", "n1"]);
    expect(recent.every((item) => ["note", "post", "project"].includes(item.kind))).toBe(true);
    const dates = recent.map((item) => Date.parse(item.date ?? ""));
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("defaults to 10 and clamps to 1..25", async () => {
    setSources(
      Array.from({ length: 40 }, (_, i) =>
        makeNote({ slug: `n${String(i).padStart(2, "0")}`, publishedAt: new Date(Date.UTC(2026, 0, i + 1)).toISOString() })
      )
    );
    expect(await getRecent()).toHaveLength(10);
    expect(await getRecent(1000)).toHaveLength(25);
    expect(await getRecent(0)).toHaveLength(1);
    expect(await getRecent(-5)).toHaveLength(1);
    expect(await getRecent(Number.NaN)).toHaveLength(10);
    expect(await getRecent(3)).toHaveLength(3);
  });
});

describe("static sources", () => {
  it("exposes profile, contact, experience, work item and projects", () => {
    expect(getProfile().links).toEqual(getContact());
    expect(getExperience()[0].workSlug).toBe("rho");
    expect(getWorkItem("rho")?.organization).toBe("Rho");
    expect(getWorkItem("nope")).toBeNull();
    expect(getProjects().length).toBeGreaterThan(0);
  });
});

describe("getNoteDetail", () => {
  it("returns the about note with the profile", async () => {
    const detail = await getNoteDetail("about-me");
    expect(detail?.kind).toBe("about");
    if (detail?.kind === "about") expect(detail.profile.name).toBe("Rishi Athanikar");
  });

  it("returns landing notes with their referenced items", async () => {
    const work = await getNoteDetail("proof-of-work");
    expect(work?.kind === "landing" && work.landing.id === "proof-of-work" && work.landing.work.length).toBeGreaterThan(0);
    const projects = await getNoteDetail("playground");
    expect(projects?.kind === "landing" && projects.landing.id === "playground" && projects.landing.projects.length).toBeGreaterThan(0);
    const links = await getNoteDetail("quick-links");
    expect(links?.kind === "landing" && links.landing.id === "quick-links" && links.landing.links.some((l) => l.href === "/Resume")).toBe(true);
  });

  it("returns the typed source for work, project, note and post", async () => {
    setSources([makeNote({ slug: "my-note" })], [makePost({ slug: "my-post" })]);
    const project = getProjects()[0];

    const work = await getNoteDetail("rho");
    expect(work?.kind === "work" && work.source.slug).toBe("rho");
    const proj = await getNoteDetail(project.slug);
    expect(proj?.kind === "project" && proj.source.name).toBe(project.name);
    const note = await getNoteDetail("my-note");
    expect(note?.kind === "note" && note.source.slug).toBe("my-note");
    const post = await getNoteDetail("my-post");
    expect(post?.kind === "post" && post.source.slug).toBe("my-post");
    expect(note?.item.url).toBe("/v2/notes/my-note");
  });

  it("returns null for an unknown slug or an unpublished note", async () => {
    setSources([makeNote({ slug: "draft", isPublished: false })]);
    expect(await getNoteDetail("does-not-exist")).toBeNull();
    expect(await getNoteDetail("draft")).toBeNull();
  });
});

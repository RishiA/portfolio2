import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sanity/loaders", () => ({
  getNotes: vi.fn(),
  getBlogPosts: vi.fn()
}));

import { getBlogPosts, getNotes } from "@/lib/sanity/loaders";
import { searchContent } from "@/lib/profile";
import { makeNote, makePost, para } from "./profile-fixtures";

beforeEach(() => {
  vi.mocked(getNotes).mockResolvedValue([]);
  vi.mocked(getBlogPosts).mockResolvedValue([]);
});

describe("searchContent", () => {
  it("ranks exact title > title contains > tag > excerpt", async () => {
    vi.mocked(getNotes).mockResolvedValue([
      makeNote({ slug: "excerpt-hit", title: "Zebra", body: para("thoughts on widgets and more") }),
      makeNote({ slug: "tag-hit", title: "Yak", tags: ["widgets"] }),
      makeNote({ slug: "title-contains", title: "All about widgets today" }),
      makeNote({ slug: "exact", title: "Widgets" })
    ]);
    const hits = await searchContent("widgets");
    expect(hits.map((hit) => hit.slug)).toEqual(["exact", "title-contains", "tag-hit", "excerpt-hit"]);
  });

  it("is case-insensitive and trims the query", async () => {
    vi.mocked(getNotes).mockResolvedValue([makeNote({ slug: "exact", title: "Widgets" })]);
    expect((await searchContent("  WIDGETS ")).map((hit) => hit.slug)).toEqual(["exact"]);
  });

  it("breaks ties by date desc then slug asc", async () => {
    vi.mocked(getNotes).mockResolvedValue([
      makeNote({ slug: "b-same", title: "Topic b", publishedAt: "2026-02-01T00:00:00Z" }),
      makeNote({ slug: "a-same", title: "Topic a", publishedAt: "2026-02-01T00:00:00Z" }),
      makeNote({ slug: "newer", title: "Topic n", publishedAt: "2026-03-01T00:00:00Z" })
    ]);
    const hits = await searchContent("topic");
    expect(hits.map((hit) => hit.slug)).toEqual(["newer", "a-same", "b-same"]);
  });

  it("searches across kinds with the hit shape", async () => {
    vi.mocked(getBlogPosts).mockResolvedValue([makePost({ slug: "post-1", title: "Banking notes", publishedAt: "2026-05-01T00:00:00Z" })]);
    const hits = await searchContent("banking");
    const post = hits.find((hit) => hit.slug === "post-1");
    expect(post).toEqual({
      slug: "post-1",
      kind: "post",
      title: "Banking notes",
      snippet: "A post excerpt.",
      url: "/v2/notes/post-1",
      date: "2026-05-01T00:00:00.000Z"
    });
    expect(hits.some((hit) => hit.kind === "work")).toBe(true);
  });

  it("matches the landing note by title", async () => {
    expect((await searchContent("quick links"))[0].slug).toBe("quick-links");
  });

  it("returns nothing for an empty or unmatched query", async () => {
    expect(await searchContent("   ")).toEqual([]);
    expect(await searchContent("zzzz-no-match-zzzz")).toEqual([]);
  });

  it("clamps the limit to 1..25 and defaults to 10", async () => {
    vi.mocked(getNotes).mockResolvedValue(
      Array.from({ length: 40 }, (_, i) => makeNote({ slug: `m${String(i).padStart(2, "0")}`, title: `match ${i}` }))
    );
    expect(await searchContent("match")).toHaveLength(10);
    expect(await searchContent("match", 500)).toHaveLength(25);
    expect(await searchContent("match", 0)).toHaveLength(1);
  });
});

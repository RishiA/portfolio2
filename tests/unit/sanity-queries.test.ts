import { describe, expect, it } from "vitest";
import { blogPostBySlugQuery, blogPostsQuery, noteBySlugQuery, notesQuery } from "@/lib/sanity/queries";

describe("Sanity queries", () => {
  it.each([
    ["notesQuery", notesQuery],
    ["noteBySlugQuery", noteBySlugQuery],
    ["blogPostsQuery", blogPostsQuery],
    ["blogPostBySlugQuery", blogPostBySlugQuery]
  ])("%s only matches published documents", (_name, query) => {
    expect(query).toContain("isPublished == true");
  });
});

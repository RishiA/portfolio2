import { describe, expect, it } from "vitest";
import { canonicalPathFor } from "@/lib/v2/canonical";
import { item } from "./v2-fixtures";

describe("canonicalPathFor", () => {
  it("points shared content at the v1 page", () => {
    expect(canonicalPathFor(item({ slug: "rho", kind: "work" }))).toBe("/work/rho");
    expect(canonicalPathFor(item({ slug: "on-money", kind: "post" }))).toBe("/blog/on-money");
    expect(canonicalPathFor(item({ slug: "a-link", kind: "note" }))).toBe("/notes/a-link");
    expect(canonicalPathFor(item({ slug: "about-me", kind: "about" }))).toBe("/about");
  });

  it("keeps landing notes and projects on their own v2 URL", () => {
    expect(canonicalPathFor(item({ slug: "playground", kind: "landing" }))).toBe("/v2/notes/playground");
    expect(canonicalPathFor(item({ slug: "agent-demo", kind: "project" }))).toBe("/v2/notes/agent-demo");
  });
});

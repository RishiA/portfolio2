import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlogPage from "@/app/(site)/blog/page";
import NotesPage from "@/app/(site)/notes/page";
import { getBlogPosts, getNotes } from "@/lib/sanity/loaders";

vi.mock("@/lib/sanity/loaders", () => ({
  getNotes: vi.fn(),
  getBlogPosts: vi.fn()
}));

describe("notes/blog empty states", () => {
  beforeEach(() => {
    vi.mocked(getNotes).mockResolvedValue([]);
    vi.mocked(getBlogPosts).mockResolvedValue([]);
  });

  it("renders notes empty state when no notes are published", async () => {
    const page = await NotesPage();
    render(page);

    expect(screen.getByText("No notes published yet.")).toBeInTheDocument();
  });

  it("renders blog empty state when no posts are published", async () => {
    const page = await BlogPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByText("No blog posts published yet.")).toBeInTheDocument();
  });
});

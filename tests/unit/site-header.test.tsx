import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/site-header";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">toggle</button>
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    pathname = "/";
  });

  it("hides primary navigation on home", () => {
    render(<SiteHeader />);

    expect(screen.queryByRole("navigation", { name: "Primary navigation" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("shows primary navigation on subpages", () => {
    pathname = "/work";
    render(<SiteHeader />);

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Proof of Work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Notes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
  });
});

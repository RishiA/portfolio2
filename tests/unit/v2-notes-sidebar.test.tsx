import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotesSidebar } from "@/components/v2/notes/notes-sidebar";
import { fixtureItems } from "./v2-fixtures";

let pathname = "/v2/notes/rho";

vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

const NOW = "2026-11-02T15:00:00.000Z";

describe("NotesSidebar", () => {
  beforeEach(() => {
    pathname = "/v2/notes/rho";
    window.sessionStorage.clear();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(NOW));
  });

  it("renders real links, date groups and the no-JS search form", () => {
    render(<NotesSidebar items={fixtureItems} nowIso={NOW} />);
    expect(screen.getByRole("link", { name: /About me/ })).toHaveAttribute("href", "/v2/notes/about-me");
    expect(screen.getByRole("heading", { name: "Pinned" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Previous 7 days" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Work history" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Yesterday" })).not.toBeInTheDocument();
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("action", "/v2/search");
    expect(form).toHaveAttribute("method", "get");
    expect(within(form).getByRole("searchbox")).toHaveAttribute("name", "q");
  });

  it("marks only the current note with aria-current", () => {
    render(<NotesSidebar items={fixtureItems} nowIso={NOW} />);
    const current = screen.getAllByRole("link").filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAttribute("href", "/v2/notes/rho");
  });

  it("shows a row's emoji, title, short date and excerpt", () => {
    render(<NotesSidebar items={fixtureItems} nowIso={NOW} />);
    const row = screen.getByRole("link", { name: /Agent demo/ });
    expect(row).toHaveTextContent("Oct 30, 2026");
    expect(row).toHaveTextContent("A small agent.");
  });

  it("filters by collection and persists the choice", () => {
    render(<NotesSidebar items={fixtureItems} nowIso={NOW} />);
    fireEvent.click(screen.getByRole("button", { name: "Writing" }));
    expect(screen.getByRole("link", { name: /On money/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /About me/ })).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem("v2-notes-collection")).toBe("writing");
  });

  it("filters as you type, announces the count and clears on Escape", () => {
    render(<NotesSidebar items={fixtureItems} nowIso={NOW} />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "rho" } });
    expect(screen.getByRole("status")).toHaveTextContent("2 results");
    expect(screen.queryByRole("link", { name: /A link/ })).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("5 notes");
  });

  it("moves focus with j and k, and focuses search with slash", () => {
    pathname = "/v2/notes";
    render(<NotesSidebar items={fixtureItems} nowIso={NOW} />);
    fireEvent.keyDown(document.body, { key: "j" });
    expect(screen.getByRole("link", { name: /About me/ })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowDown" });
    expect(document.activeElement).not.toBe(screen.getByRole("link", { name: /About me/ }));
    fireEvent.keyDown(document.activeElement as Element, { key: "k" });
    expect(screen.getByRole("link", { name: /About me/ })).toHaveFocus();
    fireEvent.keyDown(document.body, { key: "/" });
    expect(screen.getByRole("searchbox")).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "j" });
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });
});

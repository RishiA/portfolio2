import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/v2/apps/notes/sidebar";
import { fixtureItems } from "./v2-notes-fixtures";

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  Element.prototype.scrollIntoView = vi.fn();
  if (!window.CSS) Object.defineProperty(window, "CSS", { value: { escape: (value: string) => value } });
});

const renderSidebar = (selectedSlug: string | null = "about-me", isMobile = false) => {
  const onSelect = vi.fn();
  render(
    <div data-app="notes">
      <Sidebar notes={fixtureItems} selectedSlug={selectedSlug} isMobile={isMobile} onSelect={onSelect} />
    </div>
  );
  return onSelect;
};

describe("Sidebar", () => {
  it("shows the pinned group first, then older items", () => {
    renderSidebar();
    const headings = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    expect(headings[0]).toBe("Pinned");
    expect(headings).toContain("Older");
  });

  it("shows emoji and title on each row", () => {
    renderSidebar();
    expect(screen.getByRole("heading", { level: 2, name: /About me/ })).toHaveTextContent("\u{1F44B} About me");
  });

  it("highlights only the selected row on desktop", () => {
    renderSidebar("about-me");
    const selected = screen.getByRole("heading", { name: /About me/ }).closest("li");
    expect(selected?.className).toContain("bg-[#FFE390]");
    const other = screen.getByRole("heading", { name: /^Rho$/ }).closest("li");
    expect(other?.className).not.toContain("bg-[#FFE390]");
  });

  it("does not highlight a row on mobile", () => {
    renderSidebar("about-me", true);
    const row = screen.getByRole("heading", { name: /About me/ }).closest("li");
    expect(row?.className).not.toContain("bg-[#FFE390]");
  });

  it("selects a note when its row is clicked", () => {
    const onSelect = renderSidebar();
    fireEvent.click(screen.getByRole("heading", { name: /^Rho$/ }));
    expect(onSelect).toHaveBeenCalledWith("rho");
  });

  it("filters by search and opens the highlighted result with Enter", () => {
    const onSelect = renderSidebar();
    const input = screen.getByRole("textbox", { name: "Search notes" });
    fireEvent.change(input, { target: { value: "rho" } });
    const rows = screen.getAllByRole("heading", { level: 2 });
    expect(rows.map((row) => row.textContent?.trim())).toEqual(["Rho", "On money"]);

    input.focus();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("on-money");
  });

  it("shows a message when nothing matches and clears the search", () => {
    renderSidebar();
    fireEvent.change(screen.getByRole("textbox", { name: "Search notes" }), { target: { value: "zzzz" } });
    expect(screen.getByText("No results found")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.queryByText("No results found")).not.toBeInTheDocument();
  });

  it("moves the selection with the arrow keys and wraps around", () => {
    const onSelect = renderSidebar("about-me");
    const nav = screen.getByRole("navigation", { name: "Notes list" });
    const order = within(nav)
      .getAllByRole("heading", { level: 2 })
      .map((row) => row.closest("[data-note-slug]")?.getAttribute("data-note-slug"));

    act(() => {
      fireEvent.keyDown(nav, { key: "ArrowDown" });
    });
    expect(onSelect).toHaveBeenLastCalledWith(order[1]);

    act(() => {
      fireEvent.keyDown(nav, { key: "ArrowUp" });
    });
    expect(onSelect).toHaveBeenLastCalledWith(order[order.length - 1]);
  });
});

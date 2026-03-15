import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/components/theme-toggle";

const setTheme = vi.fn();
let resolvedTheme: string = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme,
    setTheme
  })
}));

vi.mock("@/lib/theme/use-mounted", () => ({
  useMounted: () => true
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockReset();
  });

  it("renders a single icon toggle button", () => {
    resolvedTheme = "light";

    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("toggles from light to dark", () => {
    resolvedTheme = "light";

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles from dark to light", () => {
    resolvedTheme = "dark";

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});

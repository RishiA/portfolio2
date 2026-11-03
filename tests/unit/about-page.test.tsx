import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "@/app/(site)/about/page";

describe("AboutPage", () => {
  it("renders the same markup as before the content moved to src/content/about.ts", () => {
    const expected = readFileSync(resolve(process.cwd(), "tests/unit/fixtures/about-page.html"), "utf8");
    const { container } = render(<AboutPage />);
    expect(container.innerHTML).toBe(expected);
  });

  it("renders the headline and the ships-code link", () => {
    render(<AboutPage />);
    expect(screen.getByText("Shipping products where getting it wrong has actual consequences.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ships code" })).toHaveAttribute("href", "https://github.com/rishi-rho");
  });
});

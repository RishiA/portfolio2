import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/(site)/page";

vi.mock("next/image", () => ({
  default: ({
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => <img {...props} alt={props.alt ?? ""} />
}));

describe("HomePage", () => {
  it("renders a minimal gateway with core navigation links", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Hello, I'm Rishi." })).toBeInTheDocument();
    const portrait = screen.getByRole("img", { name: "Sketch portrait of Rishi Athanikar" });
    expect(portrait).toBeInTheDocument();
    expect(portrait).toHaveAttribute("src", "/images/rishi_sketch.webp");
    expect(screen.getByRole("link", { name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Notes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
  });

  it("keeps home linear and cursor-free", () => {
    render(<HomePage />);

    expect(screen.queryByText("Latest Notes")).not.toBeInTheDocument();
    expect(screen.queryByText("Latest Blog")).not.toBeInTheDocument();
    expect(screen.queryByText("Featured Proof of Work")).not.toBeInTheDocument();
    expect(screen.queryByText("|")).not.toBeInTheDocument();
  });
});

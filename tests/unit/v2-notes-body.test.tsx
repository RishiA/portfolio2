import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NoteBody } from "@/components/v2/apps/notes/note-body";
import { NoteLinkContext } from "@/components/v2/apps/notes/note-link-context";
import {
  aboutDetail,
  landingLinksDetail,
  landingPlaygroundDetail,
  landingWorkDetail,
  noteDetail,
  postDetail,
  projectDetail,
  workDetail
} from "./v2-notes-fixtures";
import type { NoteDetail } from "@/lib/profile/types";

const renderBody = (detail: NoteDetail, select = vi.fn()) =>
  render(
    <NoteLinkContext.Provider value={select}>
      <NoteBody detail={detail} />
    </NoteLinkContext.Provider>
  );

describe("NoteBody", () => {
  it("renders the about note from the profile", () => {
    renderBody(aboutDetail);
    expect(screen.getByText("A product manager.")).toBeInTheDocument();
    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("target", "_blank");
  });

  it("renders Proof of work as links to each work note", () => {
    const select = vi.fn();
    renderBody(landingWorkDetail, select);
    const link = screen.getByRole("link", { name: "Rho" });
    expect(link).toHaveAttribute("href", "/v2/notes/rho");
    fireEvent.click(link);
    expect(select).toHaveBeenCalledWith("rho");
  });

  it("renders Playground as links to each project with its status", () => {
    renderBody(landingPlaygroundDetail);
    expect(screen.getByRole("link", { name: "Agent demo" })).toHaveAttribute("href", "/v2/notes/agent-demo");
    expect(screen.getByText(/Live/)).toBeInTheDocument();
  });

  it("renders Quick links, selecting notes in place and leaving the app for other links", () => {
    const select = vi.fn();
    renderBody(landingLinksDetail, select);
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "Resume" })).toHaveAttribute("href", "/Resume");
    fireEvent.click(screen.getByRole("link", { name: "About me" }));
    expect(select).toHaveBeenCalledWith("about-me");
  });

  it("renders a work item with its problem, approach, outcome and metrics", () => {
    renderBody(workDetail);
    expect(screen.getByText("Product Manager at Rho, New York")).toBeInTheDocument();
    expect(screen.getByText("Money moved slowly.")).toBeInTheDocument();
    expect(screen.getByText("Built a ledger.")).toBeInTheDocument();
    expect(screen.getByText("Transfers settle faster.")).toBeInTheDocument();
    expect(screen.getByText("Latency: -40%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Write-up" })).toHaveAttribute("href", "https://example.com/rho");
  });

  it("renders a project with status, stack and demo and source links", () => {
    renderBody(projectDetail);
    expect(screen.getByText("A small agent.")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Demo" })).toHaveAttribute("href", "https://example.com/demo");
    expect(screen.getByRole("link", { name: "Source" })).toHaveAttribute("href", "https://github.com/example/agent");
  });

  it("renders note bodies from Portable Text and selects linked notes in place", () => {
    const select = vi.fn();
    renderBody(noteDetail, select);
    fireEvent.click(screen.getByRole("link", { name: "Rho" }));
    expect(select).toHaveBeenCalledWith("rho");
    expect(screen.getByText("Below the heading.")).toBeInTheDocument();
  });

  it("collapses a section from its heading", () => {
    renderBody(noteDetail);
    fireEvent.click(screen.getByRole("button", { name: "Collapse Details" }));
    expect(screen.queryByText("Below the heading.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand Details" }));
    expect(screen.getByText("Below the heading.")).toBeInTheDocument();
  });

  it("renders post bodies from Portable Text", () => {
    renderBody(postDetail);
    expect(screen.getByText("Post body text.")).toBeInTheDocument();
  });
});

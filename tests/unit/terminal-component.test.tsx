import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Terminal } from "@/components/v2/terminal/Terminal";

const experienceBody = {
  version: 1,
  data: [
    { organization: "Rho", roleTitle: "Product Lead", periodLabel: "2023 to now", summary: "Built things.", workSlug: "rho-fintech", sortOrder: 1, url: "/v2/notes/rho-fintech" },
    { organization: "Stash", roleTitle: "PM", periodLabel: "2020 to 2023", summary: "Invested.", workSlug: "stash-invest", sortOrder: 2, url: "/v2/notes/stash-invest" }
  ]
};

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));

/** A fetch that stays pending until aborted, then rejects the way fetch does. */
function pendingFetch(signal: AbortSignal | undefined) {
  return new Promise<Response>((_resolve, reject) => {
    signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
  });
}

const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const input = () => screen.getByRole("combobox", { name: "Command" });
const type = (value: string) => fireEvent.change(input(), { target: { value } });
const press = (key: string) => fireEvent.keyDown(input(), { key });
const run = (command: string) => {
  type(command);
  fireEvent.submit(input().closest("form") as HTMLFormElement);
};

describe("Terminal", () => {
  it("shows the welcome text and runnable chips", async () => {
    fetchMock.mockReturnValue(json(experienceBody));
    render(<Terminal />);
    expect(screen.getByText("Type a command or pick one below.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "/experience" }));
    expect(await screen.findByRole("link", { name: "Rho" })).toHaveAttribute("href", "/v2/notes/rho-fintech");
  });

  it("runs /experience by typing and pressing enter", async () => {
    fetchMock.mockReturnValue(json(experienceBody));
    render(<Terminal />);
    run("/experience");
    expect(await screen.findByRole("link", { name: "Stash" })).toHaveAttribute("href", "/v2/notes/stash-invest");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/me/experience");
    expect(screen.getByRole("status")).toHaveTextContent("Loaded 2 results");
    expect(input()).toHaveValue("");
  });

  it("opens the menu on slash and Tab completes the highlighted item", () => {
    render(<Terminal />);
    type("/");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option").length).toBeGreaterThan(5);
    type("/ex");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    press("Tab");
    expect(input()).toHaveValue("/experience");
  });

  it("moves within the menu with arrows and closes it with Escape", () => {
    render(<Terminal />);
    type("/pro");
    const options = () => screen.getAllByRole("option");
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
    press("ArrowDown");
    expect(options()[1]).toHaveAttribute("aria-selected", "true");
    press("Tab");
    expect(input()).toHaveValue("/projects");
    type("/pro");
    press("Escape");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("completes work slugs after /work", async () => {
    fetchMock.mockReturnValue(json(experienceBody));
    render(<Terminal />);
    type("/work ");
    expect(await screen.findAllByRole("option")).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith("/api/me/experience");
    press("ArrowDown");
    press("Tab");
    expect(input()).toHaveValue("/work stash-invest");
  });

  it("walks history with up and down when the menu is closed", async () => {
    fetchMock.mockImplementation(() => json(experienceBody));
    render(<Terminal />);
    run("/experience");
    await screen.findByRole("link", { name: "Rho" });
    run("/help");
    await screen.findByText("Commands");
    press("ArrowUp");
    expect(input()).toHaveValue("/help");
    press("ArrowUp");
    expect(input()).toHaveValue("/experience");
    press("ArrowDown");
    expect(input()).toHaveValue("/help");
    press("ArrowDown");
    expect(input()).toHaveValue("");
  });

  it("cancels an in-flight request with Escape", async () => {
    fetchMock.mockImplementation((_url, init) => pendingFetch(init?.signal ?? undefined));
    render(<Terminal />);
    run("/experience");
    expect(await screen.findByText("Loading...")).toBeInTheDocument();
    press("Escape");
    expect(await screen.findByText("Cancelled.")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Cancelled");
  });

  it("ignores a slow earlier response once a newer command runs", async () => {
    let resolveSlow: (response: Response) => void = () => {};
    fetchMock
      .mockImplementationOnce(() => new Promise<Response>((resolve) => (resolveSlow = resolve)))
      .mockImplementationOnce(() => json({ version: 1, data: [{ id: "x", label: "FastLink", href: "https://fast.test" }] }));
    render(<Terminal />);
    run("/experience");
    await screen.findByText("Loading...");
    run("/contact");
    expect(await screen.findByRole("link", { name: "https://fast.test" })).toBeInTheDocument();
    await act(async () => {
      resolveSlow(new Response(JSON.stringify(experienceBody), { status: 200 }));
    });
    expect(screen.queryByText("Built things.")).not.toBeInTheDocument();
    expect(screen.getByText("Cancelled.")).toBeInTheDocument();
    const outputs = screen.getAllByRole("region").map((section) => section.getAttribute("aria-label"));
    expect(outputs).toEqual(["Welcome", "Output of /experience", "Output of /contact"]);
  });

  it("renders 404 and 500 messages from the API", async () => {
    fetchMock.mockImplementation((url) =>
      url.startsWith("/api/me/work/")
        ? json({ version: 1, error: { code: "not_found", message: "Not found." } }, 404)
        : url.startsWith("/api/me/recent")
          ? json({ version: 1, error: { code: "internal_error", message: "Something went wrong." } }, 500)
          : json(experienceBody)
    );
    render(<Terminal />);
    run("/work missing-slug");
    expect(await screen.findByText("Not found.")).toBeInTheDocument();
    run("/recent 3");
    expect(await screen.findByText("Something went wrong.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Error: Something went wrong.");
  });

  it("validates arguments before fetching", () => {
    fetchMock.mockImplementation(() => json(experienceBody));
    render(<Terminal />);
    run("/recent 99");
    expect(screen.getByText("The limit must be a whole number from 1 to 25.")).toBeInTheDocument();
    run("/search");
    expect(screen.getByText("Usage: /search <query>")).toBeInTheDocument();
    run("/work Bad Slug");
    run("hello");
    expect(screen.getByText("Commands start with /. Type /help to see what is available.")).toBeInTheDocument();
    run("/nope");
    expect(screen.getByText("Unknown command: /nope. Type /help to see what is available.")).toBeInTheDocument();
    // Only the one-time slug lookup may have been fetched; no command request went out.
    expect(fetchMock.mock.calls.every(([url]) => url === "/api/me/experience")).toBe(true);
  });

  it("times out after 8 seconds", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url, init) => pendingFetch(init?.signal ?? undefined));
    render(<Terminal />);
    run("/experience");
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8000);
    });
    expect(screen.getByText("Request timed out. Try again.")).toBeInTheDocument();
  });

  it("reports a network failure and offline state", async () => {
    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError("Failed to fetch")));
    render(<Terminal />);
    run("/profile");
    expect(await screen.findByText("Could not reach the server. Check your connection and try again.")).toBeInTheDocument();
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    run("/profile");
    expect(screen.getByText("You appear to be offline. Check your connection and try again.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  it("renders API text literally, never as HTML", async () => {
    const payload = "<img src=x onerror=alert(1)>";
    fetchMock.mockReturnValue(
      json({ version: 1, data: [{ organization: payload, roleTitle: payload, periodLabel: "p", summary: payload, workSlug: "x", sortOrder: 1, url: "/v2/notes/x" }] })
    );
    const { container } = render(<Terminal />);
    run("/experience");
    await waitFor(() => expect(screen.getAllByText(payload).length).toBeGreaterThan(0));
    expect(container.querySelector("img")).toBeNull();
  });

  it("does not render javascript: links", async () => {
    fetchMock.mockReturnValue(json({ version: 1, data: [{ id: "x", label: "X", href: "javascript:alert(1)" }] }));
    render(<Terminal />);
    run("/contact");
    await screen.findByText("javascript:alert(1)");
    expect(screen.queryByRole("link", { name: "javascript:alert(1)" })).not.toBeInTheDocument();
  });

  it("/mcp prints the command and copies it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<Terminal />);
    run("/mcp");
    const command = `claude mcp add --transport http rishi ${window.location.origin}/api/mcp`;
    expect(screen.getByText(command)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(command));
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("/mcp falls back to selecting the text when copying is rejected", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true
    });
    render(<Terminal />);
    run("/mcp");
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(await screen.findByText(/to copy/)).toBeInTheDocument();
    expect(window.getSelection()?.toString()).toContain("claude mcp add");
  });

  it("/clear empties the screen", () => {
    render(<Terminal />);
    run("/help");
    expect(screen.getByText("Commands")).toBeInTheDocument();
    run("/clear");
    expect(screen.queryByText("Commands")).not.toBeInTheDocument();
    expect(screen.queryByText("Type a command or pick one below.")).not.toBeInTheDocument();
  });

  it("caps the transcript at 200 entries", () => {
    render(<Terminal />);
    for (let i = 0; i < 205; i += 1) run("/help");
    expect(screen.getAllByRole("region")).toHaveLength(200);
  });
});

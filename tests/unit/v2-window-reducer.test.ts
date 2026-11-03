import { describe, expect, it } from "vitest";
import {
  DESKTOP_DEFAULT_FOCUSED_APP,
  getBaseState,
  getDesktopDefaultState,
  windowReducer,
  withFocusedApp
} from "@/lib/v2/window-context";
import type { WindowManagerState } from "@/lib/v2/types";

function open(state: WindowManagerState, appId: string) {
  return windowReducer(state, { type: "OPEN_WINDOW", appId });
}

describe("v2 window reducer", () => {
  it("starts with every window closed", () => {
    const state = getBaseState();
    expect(Object.values(state.windows).every((window) => !window.isOpen)).toBe(true);
    expect(state.focusedWindowId).toBeNull();
  });

  it("starts the desktop with Notes open and focused", () => {
    const state = getDesktopDefaultState();
    expect(state.focusedWindowId).toBe(DESKTOP_DEFAULT_FOCUSED_APP);
    expect(state.windows.notes.isOpen).toBe(true);
    expect(state.windows.music.isOpen).toBe(false);
  });

  it("opens a window on top and focuses it", () => {
    const state = open(getDesktopDefaultState(), "music");
    expect(state.windows.music.isOpen).toBe(true);
    expect(state.focusedWindowId).toBe("music");
    expect(state.windows.music.zIndex).toBeGreaterThan(state.windows.notes.zIndex);
  });

  it("raises a window above the others when it is focused", () => {
    let state = open(open(getBaseState(), "notes"), "music");
    expect(state.windows.music.zIndex).toBeGreaterThan(state.windows.notes.zIndex);

    state = windowReducer(state, { type: "FOCUS_WINDOW", appId: "notes" });
    expect(state.focusedWindowId).toBe("notes");
    expect(state.windows.notes.zIndex).toBeGreaterThan(state.windows.music.zIndex);
  });

  it("ignores focus on a closed window", () => {
    const state = getBaseState();
    expect(windowReducer(state, { type: "FOCUS_WINDOW", appId: "music" })).toBe(state);
  });

  it("minimizes a window and focuses the next visible one", () => {
    let state = open(open(getBaseState(), "notes"), "music");
    state = windowReducer(state, { type: "MINIMIZE_WINDOW", appId: "music" });

    expect(state.windows.music.isMinimized).toBe(true);
    expect(state.windows.music.isOpen).toBe(true);
    expect(state.focusedWindowId).toBe("notes");
  });

  it("restores a minimized window to the front", () => {
    let state = open(open(getBaseState(), "notes"), "music");
    state = windowReducer(state, { type: "MINIMIZE_WINDOW", appId: "music" });
    state = windowReducer(state, { type: "UNMINIMIZE_WINDOW", appId: "music" });

    expect(state.windows.music.isMinimized).toBe(false);
    expect(state.focusedWindowId).toBe("music");
  });

  it("closes a window and focuses the next one, or none", () => {
    let state = open(open(getBaseState(), "notes"), "music");
    state = windowReducer(state, { type: "CLOSE_WINDOW", appId: "music" });
    expect(state.windows.music.isOpen).toBe(false);
    expect(state.focusedWindowId).toBe("notes");

    state = windowReducer(state, { type: "CLOSE_WINDOW", appId: "notes" });
    expect(state.focusedWindowId).toBeNull();
  });

  it("opens Trash like any other window", () => {
    const state = open(getBaseState(), "trash");
    expect(state.windows.trash.isOpen).toBe(true);
    expect(state.focusedWindowId).toBe("trash");
  });

  it("opens and focuses a deep-linked app on top of saved state", () => {
    const state = withFocusedApp(getDesktopDefaultState(), "photos");
    expect(state.focusedWindowId).toBe("photos");
    expect(state.windows.photos.isOpen).toBe(true);
    expect(state.windows.notes.isOpen).toBe(true);
  });

  it("keeps z-indexes bounded", () => {
    let state = open(getBaseState(), "notes");
    for (let i = 0; i < 120; i += 1) {
      state = windowReducer(state, { type: "FOCUS_WINDOW", appId: "notes" });
    }
    expect(state.windows.notes.zIndex).toBeLessThanOrEqual(60);
  });
});

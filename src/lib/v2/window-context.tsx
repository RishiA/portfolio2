"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { WindowState, WindowManagerState, WindowAction, Position, Size } from "./types";
import { WINDOWED_APPS, getAppById, migrateAppWindowFrame } from "./app-config";
import { loadWindowState, saveWindowStatePayload } from "./window-state-storage";
import { DOCK_HEIGHT, MENU_BAR_HEIGHT } from "./use-window-behavior";

const WINDOW_STATE_PERSIST_DEBOUNCE_MS = 1000;
const DEFAULT_WINDOW_DOCK_GAP = 12;

function fitWindowPresetToDesktop(position: Position, size: Size): { position: Position; size: Size } {
  if (typeof window === "undefined") {
    return { position, size };
  }

  const availableBottom = window.innerHeight - DOCK_HEIGHT - DEFAULT_WINDOW_DOCK_GAP;
  const availableHeight = Math.max(1, availableBottom - MENU_BAR_HEIGHT);
  const height = Math.min(size.height, availableHeight);
  const y = Math.min(Math.max(position.y, MENU_BAR_HEIGHT), availableBottom - height);

  return {
    position: { ...position, y },
    size: { ...size, height }
  };
}

function getDefaultWindowState(appId: string): WindowState {
  const app = getAppById(appId);
  if (!app) {
    throw new Error(`Unknown app: ${appId}`);
  }
  const preset = fitWindowPresetToDesktop(app.defaultPosition, app.defaultSize);
  return {
    id: appId,
    appId,
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: preset.position,
    size: preset.size,
    zIndex: 0
  };
}

/** The app that is open and focused when the desktop first loads. */
export const DESKTOP_DEFAULT_FOCUSED_APP = "notes";

/** Creates a fresh state with every window closed. */
export function getBaseState(): WindowManagerState {
  const windows: Record<string, WindowState> = {};
  WINDOWED_APPS.forEach((app) => {
    windows[app.id] = getDefaultWindowState(app.id);
  });
  return { windows, focusedWindowId: null, nextZIndex: 1 };
}

/** Desktop default state: Notes open and focused. */
export function getDesktopDefaultState(): WindowManagerState {
  const state = getBaseState();
  const notes = state.windows[DESKTOP_DEFAULT_FOCUSED_APP];

  notes.isOpen = true;
  notes.zIndex = 1;
  state.focusedWindowId = DESKTOP_DEFAULT_FOCUSED_APP;
  state.nextZIndex = 2;
  return state;
}

/** Opens and focuses an app on top of an existing state. Used for deep links. */
export function withFocusedApp(savedState: WindowManagerState, appId: string): WindowManagerState {
  // Un-maximize any other maximized windows so the focused app is visible
  // (maximized windows use MAXIMIZED_Z_INDEX which would cover the focused app)
  const windowUpdates: Record<string, WindowState> = {};
  for (const [windowId, windowState] of Object.entries(savedState.windows)) {
    if (windowId !== appId && windowState.isMaximized) {
      windowUpdates[windowId] = { ...windowState, isMaximized: false };
    }
  }
  const updatedWindows = { ...savedState.windows, ...windowUpdates };

  return {
    ...savedState,
    windows: {
      ...updatedWindows,
      [appId]: {
        ...updatedWindows[appId],
        isOpen: true,
        isMinimized: false,
        zIndex: savedState.nextZIndex
      }
    },
    focusedWindowId: appId,
    nextZIndex: savedState.nextZIndex + 1
  };
}

function deserializeWindowState(serializedState: string): WindowManagerState | null {
  try {
    const parsed = JSON.parse(serializedState);
    if (!parsed.windows || typeof parsed.nextZIndex !== "number") return null;

    const mergedWindows: Record<string, WindowState> = { ...parsed.windows };
    WINDOWED_APPS.forEach((app) => {
      if (!mergedWindows[app.id]) {
        mergedWindows[app.id] = getDefaultWindowState(app.id);
      }
    });

    // Keep restored frames compatible with current app layout contracts.
    Object.entries(mergedWindows).forEach(([windowId, windowState]) => {
      if (!windowState?.size) return;
      const frame = migrateAppWindowFrame(
        windowState.appId,
        windowState.position,
        windowState.size,
        typeof window === "undefined" ? undefined : window.innerWidth
      );
      if (frame.size.width === windowState.size.width && frame.size.height === windowState.size.height) {
        return;
      }
      mergedWindows[windowId] = { ...windowState, ...frame };
    });

    return { ...parsed, windows: mergedWindows };
  } catch {
    return null;
  }
}

function loadStateFromStorage(): WindowManagerState | null {
  if (typeof window === "undefined") return null;
  return loadWindowState(sessionStorage, deserializeWindowState);
}

function saveSerializedStateToStorage(serializedState: string): void {
  if (typeof window === "undefined") return;
  try {
    saveWindowStatePayload(sessionStorage, serializedState);
  } catch (e) {
    console.error("Failed to save window state:", e);
  }
}

// Max z-index before we normalize (windows stay in 1-50 range)
const MAX_Z_INDEX = 50;

// Z-index for maximized windows - always above normal windows
export const MAXIMIZED_Z_INDEX = 80;

// Normalize z-indexes to prevent unbounded growth
function normalizeZIndexes(state: WindowManagerState): WindowManagerState {
  if (state.nextZIndex <= MAX_Z_INDEX) return state;

  const sortedWindows = Object.values(state.windows).sort((a, b) => a.zIndex - b.zIndex);

  const newWindows: Record<string, WindowState> = {};
  sortedWindows.forEach((win, index) => {
    newWindows[win.id] = { ...win, zIndex: index + 1 };
  });

  return {
    ...state,
    windows: newWindows,
    nextZIndex: sortedWindows.length + 1
  };
}

function nextVisibleWindowId(state: WindowManagerState, excludedAppId: string): string | null {
  const openWindows = Object.values(state.windows)
    .filter((w) => w.isOpen && !w.isMinimized && w.appId !== excludedAppId)
    .sort((a, b) => b.zIndex - a.zIndex);
  return openWindows[0]?.id || null;
}

export function windowReducer(state: WindowManagerState, action: WindowAction): WindowManagerState {
  state = normalizeZIndexes(state);

  if (action.type === "RESTORE_STATE") return action.state;

  const window = state.windows[action.appId];
  if (!window) return state;
  const { appId } = action;

  switch (action.type) {
    case "OPEN_WINDOW":
      return {
        ...state,
        windows: { ...state.windows, [appId]: { ...window, isOpen: true, zIndex: state.nextZIndex } },
        focusedWindowId: appId,
        nextZIndex: state.nextZIndex + 1
      };

    case "CLOSE_WINDOW":
      return {
        ...state,
        windows: { ...state.windows, [appId]: { ...window, isOpen: false, isMaximized: false } },
        focusedWindowId: nextVisibleWindowId(state, appId)
      };

    case "MINIMIZE_WINDOW":
      if (!window.isOpen) return state;
      return {
        ...state,
        windows: { ...state.windows, [appId]: { ...window, isMinimized: true } },
        focusedWindowId: nextVisibleWindowId(state, appId)
      };

    case "FOCUS_WINDOW":
      if (!window.isOpen) return state;
      return {
        ...state,
        windows: { ...state.windows, [appId]: { ...window, zIndex: state.nextZIndex } },
        focusedWindowId: appId,
        nextZIndex: state.nextZIndex + 1
      };

    case "MOVE_WINDOW":
      return { ...state, windows: { ...state.windows, [appId]: { ...window, position: action.position } } };

    case "RESIZE_WINDOW":
      return {
        ...state,
        windows: {
          ...state.windows,
          [appId]: { ...window, size: action.size, ...(action.position && { position: action.position }) }
        }
      };

    case "MAXIMIZE_WINDOW":
      return {
        ...state,
        windows: { ...state.windows, [appId]: { ...window, isMaximized: true, zIndex: state.nextZIndex } },
        focusedWindowId: appId,
        nextZIndex: state.nextZIndex + 1
      };

    case "RESTORE_WINDOW":
      return {
        ...state,
        windows: {
          ...state.windows,
          [appId]: { ...window, isMinimized: false, isMaximized: false, zIndex: state.nextZIndex }
        },
        focusedWindowId: appId,
        nextZIndex: state.nextZIndex + 1
      };

    case "UNMINIMIZE_WINDOW":
      return {
        ...state,
        windows: {
          ...state.windows,
          // Preserve isMaximized so fullscreen windows restore to fullscreen
          [appId]: { ...window, isMinimized: false, zIndex: state.nextZIndex }
        },
        focusedWindowId: appId,
        nextZIndex: state.nextZIndex + 1
      };

    default:
      return state;
  }
}

interface WindowManagerContextValue {
  state: WindowManagerState;
  openWindow: (appId: string) => void;
  closeWindow: (appId: string) => void;
  focusWindow: (appId: string) => void;
  moveWindow: (appId: string, position: Position) => void;
  resizeWindow: (appId: string, size: Size, position?: Position) => void;
  minimizeWindow: (appId: string) => void;
  unminimizeWindow: (appId: string) => void;
  toggleMaximize: (appId: string) => void;
  getWindow: (appId: string) => WindowState | undefined;
  hasOpenWindows: (appId: string) => boolean;
  getFocusedAppId: () => string | null;
  // Menu bar state (prevents window focus when menu is open)
  // Uses a ref for synchronous checks in event handlers
  isMenuOpenRef: React.MutableRefObject<boolean>;
  setMenuOpen: (isOpen: boolean) => void;
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

interface WindowManagerProviderProps {
  children: React.ReactNode;
  initialAppId?: string; // If provided, this app will be opened and focused on load
}

export function WindowManagerProvider({ children, initialAppId }: WindowManagerProviderProps) {
  const persistTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = React.useRef<WindowManagerState | null>(null);
  const lastPersistedStateRef = React.useRef<string | null>(null);

  /**
   * A returning tab restores its saved windows; a deep link focuses its app.
   * A new tab starts from the desktop default with the requested app focused.
   */
  const computeInitialState = React.useCallback((): WindowManagerState => {
    const savedState = loadStateFromStorage();
    const baseState = savedState ?? getDesktopDefaultState();

    if (initialAppId && (!savedState || savedState.focusedWindowId !== initialAppId)) {
      return withFocusedApp(baseState, initialAppId);
    }
    return baseState;
  }, [initialAppId]);

  const [state, dispatch] = useReducer(windowReducer, null, computeInitialState);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const isMenuOpenRef = React.useRef(false);
  const setMenuOpen = useCallback((isOpen: boolean) => {
    isMenuOpenRef.current = isOpen;
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  // Debounce local persistence to avoid excessive writes during drag/resize
  useEffect(() => {
    if (!isHydrated) return;

    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(() => {
      const serializedState = JSON.stringify(state);
      if (serializedState !== lastPersistedStateRef.current) {
        saveSerializedStateToStorage(serializedState);
        lastPersistedStateRef.current = serializedState;
      }
      persistTimeoutRef.current = null;
    }, WINDOW_STATE_PERSIST_DEBOUNCE_MS);

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [state, isHydrated]);

  // Flush pending state on unmount
  useEffect(() => {
    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
      if (latestStateRef.current) {
        const serializedState = JSON.stringify(latestStateRef.current);
        if (serializedState !== lastPersistedStateRef.current) {
          saveSerializedStateToStorage(serializedState);
          lastPersistedStateRef.current = serializedState;
        }
      }
    };
  }, []);

  const openWindow = useCallback((appId: string) => dispatch({ type: "OPEN_WINDOW", appId }), []);
  const closeWindow = useCallback((appId: string) => dispatch({ type: "CLOSE_WINDOW", appId }), []);
  const focusWindow = useCallback((appId: string) => dispatch({ type: "FOCUS_WINDOW", appId }), []);
  const moveWindow = useCallback(
    (appId: string, position: Position) => dispatch({ type: "MOVE_WINDOW", appId, position }),
    []
  );
  const resizeWindow = useCallback(
    (appId: string, size: Size, position?: Position) => dispatch({ type: "RESIZE_WINDOW", appId, size, position }),
    []
  );
  const minimizeWindow = useCallback((appId: string) => dispatch({ type: "MINIMIZE_WINDOW", appId }), []);
  const unminimizeWindow = useCallback((appId: string) => dispatch({ type: "UNMINIMIZE_WINDOW", appId }), []);

  const toggleMaximize = useCallback(
    (appId: string) => {
      dispatch({ type: state.windows[appId]?.isMaximized ? "RESTORE_WINDOW" : "MAXIMIZE_WINDOW", appId });
    },
    [state.windows]
  );

  const getWindow = useCallback((appId: string) => state.windows[appId], [state.windows]);

  const hasOpenWindows = useCallback((appId: string) => state.windows[appId]?.isOpen ?? false, [state.windows]);

  const getFocusedAppId = useCallback(() => state.focusedWindowId, [state.focusedWindowId]);

  const value: WindowManagerContextValue = {
    state,
    openWindow,
    closeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    minimizeWindow,
    unminimizeWindow,
    toggleMaximize,
    getWindow,
    hasOpenWindows,
    getFocusedAppId,
    isMenuOpenRef,
    setMenuOpen
  };

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager(): WindowManagerContextValue {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error("useWindowManager must be used within a WindowManagerProvider");
  }
  return context;
}

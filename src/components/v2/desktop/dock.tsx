"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useState, useEffect, useRef, useMemo, useCallback, forwardRef } from "react";
import { APPS, getAppById, TRASH_WINDOW_ID } from "@/lib/v2/app-config";
import { useWindowManager } from "@/lib/v2/window-context";
import { cn } from "@/lib/v2/utils";
import { useClickOutside } from "@/lib/v2/use-click-outside";
import type { WindowState } from "@/lib/v2/types";
import { registerDockThumbnail, unregisterDockThumbnail } from "@/lib/v2/dock-thumbnails";
import { useSystemSettings } from "@/lib/v2/system-settings-context";
import { APP_ICONS, TrashIcon } from "./app-icons";

function DockTooltip({
  label,
  lift,
}: {
  label: string;
  lift: number;
}) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 z-[1] -translate-x-1/2 transition-[top] duration-100 ease-out"
      style={{ top: `${-46 - lift}px` }}
    >
      <svg
        viewBox="0 0 100 44"
        className="h-9 min-w-16"
        style={{ width: `${Math.max(64, label.length * 9 + 24)}px` }}
        preserveAspectRatio="none"
      >
        <path
          d="M 12 0
             H 88
             Q 100 0 100 12
             V 20
             Q 100 32 88 32
             H 56
             L 50 38
             L 44 32
             H 12
             Q 0 32 0 20
             V 12
             Q 0 0 12 0
             Z"
          className="fill-white/70 dark:fill-zinc-800/70"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap px-3 pb-2 text-xs font-medium text-zinc-800 dark:text-white">
        {label}
      </span>
    </div>
  );
}

const DOCK_SCALE_STORAGE_KEY = "desktopDockDesiredScale";
const DOCK_MAGNIFICATION_STORAGE_KEY = "desktopDockMagnification";
const DOCK_MIN_DESIRED_SCALE = 0.7;
const DOCK_MAX_DESIRED_SCALE = 1.6;
const DOCK_DEFAULT_SCALE = 1;
const DOCK_SCALE_STEP = 0.05;
const DOCK_DRAG_PIXELS_PER_SCALE = 220;
const DOCK_MAGNIFICATION_SCALE = 1.4;
const DOCK_MAGNIFICATION_RADIUS = 0.88;

const BASE_ICON_SIZE = 48;
const BASE_GAP = 4;
const BASE_PADDING_X = 12;
const BASE_PADDING_Y = 6;
const BASE_DIVIDER_WIDTH = 1;
const BASE_DIVIDER_MARGIN_X = 4;
const BASE_DIVIDER_HEIGHT = 48;
const BASE_DOT_SIZE = 4;
const BASE_TRASH_HANDLE_HITBOX_WIDTH = 14;
const BASE_HANDLE_LINE_WIDTH = 1;

// Minimized-window Dock thumbnails (macOS default: minimize-to-application is off)
const MINIMIZED_THUMB_MIN_RATIO = 0.6;
const MINIMIZED_THUMB_MAX_RATIO = 1.8;

function getMinimizedWindowLabel(window: WindowState): string {
  return getAppById(window.appId)?.name ?? window.appId;
}

function getMinimizedThumbRatio(window: WindowState): number {
  if (window.size.height <= 0) return 1;
  return clamp(
    window.size.width / window.size.height,
    MINIMIZED_THUMB_MIN_RATIO,
    MINIMIZED_THUMB_MAX_RATIO
  );
}

// One Dock thumbnail for a minimized window. The container registers with the
// dock-thumbnail registry so the Window component portals its live tree here,
// making the thumbnail a scaled mirror of the real window.
const MinimizedWindowThumbnail = forwardRef<
  HTMLButtonElement,
  {
    window: WindowState;
    height: number;
    magnificationScale: number;
    isResizing: boolean;
    isHovered: boolean;
    onHoverChange: (hovered: boolean) => void;
    onRestore: () => void;
  }
>(function MinimizedWindowThumbnail(
  {
    window,
    height,
    magnificationScale,
    isResizing,
    isHovered,
    onHoverChange,
    onRestore,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Stable ref callback so the registry entry survives Dock re-renders
  // (magnification updates re-render the Dock every pointer-move frame).
  const setContainer = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) {
        containerRef.current = element;
        registerDockThumbnail(window.id, element);
      } else {
        const previous = containerRef.current;
        containerRef.current = null;
        if (previous) unregisterDockThumbnail(window.id, previous);
      }
    },
    [window.id]
  );

  const label = getMinimizedWindowLabel(window);
  const thumbWidth = Math.round(height * getMinimizedThumbRatio(window));
  // Fit the window inside the thumbnail; the portaled window reads this via
  // var(--dock-thumb-scale) and scales itself around its center.
  const thumbScale = Math.min(
    height / window.size.height,
    thumbWidth / window.size.width
  );

  return (
    <button
      type="button"
      ref={ref}
      aria-label={`Show ${label}`}
      onClick={onRestore}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className="group relative flex flex-col items-center rounded-md outline-none transition-[width,transform] duration-100 ease-out flex-shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
      style={{ width: `${thumbWidth * magnificationScale}px` }}
    >
      {isHovered && !isResizing && (
        <DockTooltip
          label={label}
          lift={(magnificationScale - 1) * height}
        />
      )}
      <div
        ref={setContainer}
        aria-hidden
        className="relative flex items-center justify-center overflow-hidden rounded-[5px] transition-transform duration-100 ease-out"
        style={
          {
            width: `${thumbWidth}px`,
            height: `${height}px`,
            transform: `scale(${magnificationScale})`,
            transformOrigin: "bottom center",
            "--dock-thumb-scale": String(thumbScale),
          } as React.CSSProperties
        }
      />
      <div
        aria-hidden
        className="mt-1 rounded-full opacity-0"
        style={{ width: "4px", height: "4px" }}
      />
    </button>
  );
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundScale(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function getInitialDockScale(): number {
  if (typeof window === "undefined") return DOCK_DEFAULT_SCALE;
  const raw = window.sessionStorage.getItem(DOCK_SCALE_STORAGE_KEY);
  if (!raw) return DOCK_DEFAULT_SCALE;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DOCK_DEFAULT_SCALE;
  return clamp(parsed, DOCK_MIN_DESIRED_SCALE, DOCK_MAX_DESIRED_SCALE);
}

function getInitialDockMagnification(): boolean {
  if (typeof window === "undefined") return true;
  return window.sessionStorage.getItem(DOCK_MAGNIFICATION_STORAGE_KEY) !== "false";
}

export function Dock() {
  const { showDockIndicators } = useSystemSettings();
  const { closeWindow, openWindow, focusWindow, unminimizeWindow, state, getWindow, hasOpenWindows } =
    useWindowManager();
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [desiredScale, setDesiredScale] = useState(getInitialDockScale);
  const [magnificationEnabled, setMagnificationEnabled] = useState(
    getInitialDockMagnification
  );
  const [isDockMenuOpen, setIsDockMenuOpen] = useState(false);
  const [openAppMenuId, setOpenAppMenuId] = useState<string | null>(null);
  const [appMenuPosition, setAppMenuPosition] = useState({ left: 0, bottom: 0 });
  const [isResizingDock, setIsResizingDock] = useState(false);
  const [magnificationScales, setMagnificationScales] = useState<
    Record<string, number>
  >({});
  const dragStateRef = useRef<{ pointerId: number; startY: number; startScale: number } | null>(null);
  const previousUserSelectRef = useRef<string | null>(null);
  const previousCursorRef = useRef<string | null>(null);
  const dockMenuRef = useRef<HTMLDivElement>(null);
  const appMenuRef = useRef<HTMLDivElement>(null);
  const dockItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const magnificationFrameRef = useRef<number | null>(null);
  const pendingPointerXRef = useRef<number | null>(null);
  const closeDockMenu = useCallback(() => setIsDockMenuOpen(false), []);
  const closeAppMenu = useCallback(() => setOpenAppMenuId(null), []);

  useClickOutside(dockMenuRef, closeDockMenu, isDockMenuOpen);
  useClickOutside(appMenuRef, closeAppMenu, openAppMenuId !== null);

  // Open windows that are currently minimized render as Dock thumbnails
  // next to Trash, mirroring macOS's default minimize behavior.
  const minimizedWindows = useMemo(
    () => Object.values(state.windows).filter((w) => w.isOpen && w.isMinimized),
    [state.windows]
  );

  // When a thumbnail mounts or unmounts, the Dock panel must resize
  // instantly (like macOS) so the minimize/restore flight lands exactly in
  // the slot instead of chasing a 300ms width animation.
  const prevThumbCountRef = useRef(0);
  const thumbnailsChangedCount = minimizedWindows.length !== prevThumbCountRef.current;
  prevThumbCountRef.current = minimizedWindows.length;

  const handleAppClick = (appId: string) => {
    const windowState = getWindow(appId);
    if (windowState?.isOpen) {
      if (windowState.isMinimized) {
        unminimizeWindow(appId);
      } else {
        focusWindow(appId);
      }
    } else {
      openWindow(appId);
    }
  };

  const trashMagnificationScale = magnificationEnabled && !isResizingDock ? magnificationScales[TRASH_WINDOW_ID] ?? 1 : 1;
  const openAppMenuApp = openAppMenuId ? getAppById(openAppMenuId) : undefined;
  const openAppMenuIsOpen = openAppMenuApp ? hasOpenWindows(openAppMenuApp.id) : false;

  const effectiveScale = useMemo(
    () => roundScale(clamp(desiredScale, DOCK_MIN_DESIRED_SCALE, DOCK_MAX_DESIRED_SCALE)),
    [desiredScale]
  );

  const metrics = useMemo(() => {
    const scale = effectiveScale;
    return {
      icon: Math.max(30, Math.round(BASE_ICON_SIZE * scale)),
      gap: Math.max(2, Math.round(BASE_GAP * scale)),
      padX: Math.max(8, Math.round(BASE_PADDING_X * scale)),
      padY: Math.max(4, Math.round(BASE_PADDING_Y * scale)),
      dividerWidth: Math.max(1, Math.round(BASE_DIVIDER_WIDTH * scale)),
      dividerHeight: Math.max(30, Math.round(BASE_DIVIDER_HEIGHT * scale)),
      dividerMarginX: Math.max(2, Math.round(BASE_DIVIDER_MARGIN_X * scale)),
      dot: Math.max(2, Math.round(BASE_DOT_SIZE * scale)),
      handleHitboxWidth: Math.max(10, Math.round(BASE_TRASH_HANDLE_HITBOX_WIDTH * scale)),
      handleLineWidth: Math.max(1, Math.round(BASE_HANDLE_LINE_WIDTH * scale)),
    };
  }, [effectiveScale]);

  const resetDockMagnification = useCallback(() => {
    pendingPointerXRef.current = null;
    if (magnificationFrameRef.current !== null) {
      window.cancelAnimationFrame(magnificationFrameRef.current);
      magnificationFrameRef.current = null;
    }
    setMagnificationScales((current) =>
      Object.keys(current).length === 0 ? current : {}
    );
  }, []);

  const handleDockPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (
        event.pointerType !== "mouse" ||
        !magnificationEnabled ||
        isResizingDock ||
        (event.target as Element).closest('[data-dock-static="true"]')
      ) {
        resetDockMagnification();
        return;
      }

      pendingPointerXRef.current = event.clientX;
      if (magnificationFrameRef.current !== null) return;

      magnificationFrameRef.current = window.requestAnimationFrame(() => {
        magnificationFrameRef.current = null;
        const pointerX = pendingPointerXRef.current;
        if (pointerX === null) return;

        const radius = metrics.icon * DOCK_MAGNIFICATION_RADIUS;
        const nextScales: Record<string, number> = {};

        Object.entries(dockItemRefs.current).forEach(([itemId, item]) => {
          if (!item) return;
          const rect = item.getBoundingClientRect();
          const distance = Math.abs(pointerX - (rect.left + rect.width / 2));
          const influence = Math.exp(
            -(distance * distance) / (2 * radius * radius)
          );
          nextScales[itemId] =
            1 + (DOCK_MAGNIFICATION_SCALE - 1) * influence;
        });

        setMagnificationScales(nextScales);
      });
    },
    [
      isResizingDock,
      magnificationEnabled,
      metrics.icon,
      resetDockMagnification,
    ]
  );

  const endDockResize = useCallback(() => {
    dragStateRef.current = null;
    setIsResizingDock(false);
    if (typeof document !== "undefined") {
      if (previousUserSelectRef.current !== null) {
        document.body.style.userSelect = previousUserSelectRef.current;
      } else {
        document.body.style.removeProperty("user-select");
      }
      if (previousCursorRef.current !== null) {
        document.body.style.cursor = previousCursorRef.current;
      } else {
        document.body.style.removeProperty("cursor");
      }
    }
  }, []);

  const updateDesiredScale = useCallback((next: number) => {
    const bounded = roundScale(clamp(next, DOCK_MIN_DESIRED_SCALE, DOCK_MAX_DESIRED_SCALE));
    setDesiredScale(bounded);
  }, []);

  const handleResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button === 2) {
        event.preventDefault();
        event.stopPropagation();
        setHoveredApp(null);
        resetDockMagnification();
        setIsDockMenuOpen(true);
        return;
      }
      if (event.button !== 0) return;
      if (event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        setHoveredApp(null);
        resetDockMagnification();
        setIsDockMenuOpen(true);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      dragStateRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startScale: desiredScale,
      };
      previousUserSelectRef.current = document.body.style.userSelect;
      previousCursorRef.current = document.body.style.cursor;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ns-resize";
      setIsResizingDock(true);
    },
    [desiredScale, resetDockMagnification]
  );

  const handleResizePointerMove = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const viewportHeight = window.innerHeight;
    if (event.clientY >= viewportHeight - 1) {
      updateDesiredScale(DOCK_MIN_DESIRED_SCALE);
      return;
    }
    if (event.clientY <= 1) {
      updateDesiredScale(DOCK_MAX_DESIRED_SCALE);
      return;
    }
    const deltaY = drag.startY - event.clientY;
    const scaleDelta = deltaY / DOCK_DRAG_PIXELS_PER_SCALE;
    updateDesiredScale(drag.startScale + scaleDelta);
  }, [updateDesiredScale]);

  const handleResizePointerUp = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    }
    endDockResize();
  }, [endDockResize]);

  const handleResizePointerCancel = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    endDockResize();
  }, [endDockResize]);

  const handleResizeKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      updateDesiredScale(desiredScale + DOCK_SCALE_STEP);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      updateDesiredScale(desiredScale - DOCK_SCALE_STEP);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      updateDesiredScale(DOCK_MIN_DESIRED_SCALE);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      updateDesiredScale(DOCK_MAX_DESIRED_SCALE);
    }
  }, [desiredScale, updateDesiredScale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(DOCK_SCALE_STORAGE_KEY, String(desiredScale));
  }, [desiredScale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(
      DOCK_MAGNIFICATION_STORAGE_KEY,
      String(magnificationEnabled)
    );
  }, [magnificationEnabled]);

  useEffect(() => {
    if (!magnificationEnabled || isResizingDock) {
      resetDockMagnification();
    }
  }, [isResizingDock, magnificationEnabled, resetDockMagnification]);

  useEffect(() => {
    if (!isResizingDock || typeof window === "undefined") return;
    const forceEndResize = () => {
      endDockResize();
    };
    window.addEventListener("pointerup", forceEndResize);
    window.addEventListener("pointercancel", forceEndResize);
    window.addEventListener("blur", forceEndResize);
    return () => {
      window.removeEventListener("pointerup", forceEndResize);
      window.removeEventListener("pointercancel", forceEndResize);
      window.removeEventListener("blur", forceEndResize);
    };
  }, [isResizingDock, endDockResize]);

  useEffect(() => {
    return () => {
      endDockResize();
      resetDockMagnification();
    };
  }, [endDockResize, resetDockMagnification]);

  return (
    <>
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[60]">
        <div
          onPointerMove={handleDockPointerMove}
          onPointerLeave={() => {
            setHoveredApp(null);
            resetDockMagnification();
          }}
          className={cn(
            "flex items-end bg-white/30 dark:bg-black/30 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-white/10 shadow-lg w-max",
            isResizingDock || thumbnailsChangedCount ? "transition-none" : "transition-all duration-300"
          )}
          style={{
            gap: `${metrics.gap}px`,
            padding: `${metrics.padY}px ${metrics.padX}px`,
          }}
        >
          {APPS.map((app) => {
            const isOpen = hasOpenWindows(app.id);
            const Icon = APP_ICONS[app.id];
            const magnificationScale = magnificationEnabled && !isResizingDock ? magnificationScales[app.id] ?? 1 : 1;
            const tooltipLift = (magnificationScale - 1) * metrics.icon;

            return (
              <button
                key={app.id}
                ref={(item) => {
                  dockItemRefs.current[app.id] = item;
                }}
                aria-label={app.name}
                aria-haspopup="menu"
                aria-expanded={openAppMenuId === app.id}
                data-testid={`dock-app-${app.id}`}
                onClick={() => handleAppClick(app.id)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  const rect = event.currentTarget.getBoundingClientRect();
                  setAppMenuPosition({
                    left: rect.left + rect.width / 2,
                    bottom: window.innerHeight - rect.top + 8,
                  });
                  setHoveredApp(null);
                  resetDockMagnification();
                  setIsDockMenuOpen(false);
                  setOpenAppMenuId(app.id);
                }}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                className="group relative flex flex-col items-center outline-none transition-[width,transform] duration-100 ease-out flex-shrink-0 active:scale-95"
                style={{ width: `${metrics.icon * magnificationScale}px` }}
              >
                {hoveredApp === app.id && !isResizingDock && <DockTooltip label={app.name} lift={tooltipLift} />}
                <div
                  className="relative flex items-center justify-center transition-transform duration-100 ease-out"
                  style={{
                    width: `${metrics.icon}px`,
                    height: `${metrics.icon}px`,
                    transform: `scale(${magnificationScale})`,
                    transformOrigin: "bottom center",
                  }}
                >
                  <Icon
                    aria-hidden
                    className="h-full w-full object-contain [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.35))] pointer-events-none"
                  />
                </div>
                <div
                  className={cn(
                    "rounded-full mt-1 transition-opacity",
                    showDockIndicators && isOpen ? "bg-black/60 dark:bg-white/60 opacity-100" : "opacity-0"
                  )}
                  style={{ width: `${metrics.dot}px`, height: `${metrics.dot}px` }}
                />
              </button>
            );
          })}
        {/* Resize handle before Trash */}
        <div
          ref={dockMenuRef}
          data-dock-static="true"
          className="relative self-center"
        >
          <button
            type="button"
            aria-label="Resize Dock"
            aria-haspopup="menu"
            aria-expanded={isDockMenuOpen}
            title="Resize Dock"
            onMouseDown={(event) => {
              if (event.button !== 2 && !event.ctrlKey) return;
              event.preventDefault();
              event.stopPropagation();
              setHoveredApp(null);
              resetDockMagnification();
              setIsDockMenuOpen(true);
            }}
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerCancel}
            onLostPointerCapture={endDockResize}
            onKeyDown={handleResizeKeyDown}
            onContextMenu={(event) => {
              event.preventDefault();
              setHoveredApp(null);
              resetDockMagnification();
              setIsDockMenuOpen(true);
            }}
            onMouseEnter={() => {
              setHoveredApp(null);
              resetDockMagnification();
            }}
            className="relative rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
            style={{
              width: `${metrics.handleHitboxWidth}px`,
              height: `${metrics.dividerHeight + 8}px`,
              marginLeft: `${metrics.dividerMarginX}px`,
              marginRight: `${metrics.dividerMarginX}px`,
              cursor: "ns-resize",
              touchAction: "none",
            }}
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/20 dark:bg-white/10 rounded-full",
                isResizingDock && "bg-black/35 dark:bg-white/30"
              )}
              style={{
                width: `${metrics.handleLineWidth}px`,
                height: `${metrics.dividerHeight}px`,
              }}
            />
          </button>

          {isDockMenuOpen && (
            <div
              role="menu"
              className="absolute bottom-[calc(100%+8px)] left-1/2 z-[90] w-max -translate-x-1/2 rounded-lg border border-black/10 bg-white/95 py-1 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-800/95"
            >
              <span
                aria-hidden
                className="absolute left-1/2 top-full h-2 w-3 -translate-x-1/2 bg-white/95 [clip-path:polygon(0_0,100%_0,50%_100%)] dark:bg-zinc-800/95"
              />
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={magnificationEnabled}
                onClick={() => {
                  setMagnificationEnabled((enabled) => !enabled);
                  closeDockMenu();
                }}
                className="relative z-[1] flex w-full items-center justify-between whitespace-nowrap px-3 py-1.5 text-left text-xs transition-colors can-hover:hover:bg-blue-500 can-hover:hover:text-white"
              >
                {magnificationEnabled
                  ? "Turn Magnification Off"
                  : "Turn Magnification On"}
              </button>
            </div>
          )}
        </div>

        {/* Minimized-window thumbnails (macOS shows these beside the divider, before Trash) */}
        {minimizedWindows.map((window) => {
          const itemKey = `minimized:${window.id}`;
          const magnificationScale = magnificationEnabled && !isResizingDock ? magnificationScales[itemKey] ?? 1 : 1;

          return (
            <MinimizedWindowThumbnail
              key={window.id}
              ref={(item: HTMLButtonElement | null) => {
                dockItemRefs.current[itemKey] = item;
              }}
              window={window}
              height={metrics.icon}
              magnificationScale={magnificationScale}
              isResizing={isResizingDock}
              isHovered={hoveredApp === itemKey}
              onHoverChange={(hovered) => setHoveredApp(hovered ? itemKey : null)}
              onRestore={() => unminimizeWindow(window.appId)}
            />
          );
        })}

        {/* Trash */}
        <button
          ref={(item) => {
            dockItemRefs.current[TRASH_WINDOW_ID] = item;
          }}
          aria-label="Trash"
          data-testid="dock-app-trash"
          onClick={() => handleAppClick(TRASH_WINDOW_ID)}
          onMouseEnter={() => setHoveredApp(TRASH_WINDOW_ID)}
          onMouseLeave={() => setHoveredApp(null)}
          className="group relative flex flex-col items-center transition-[width,transform] duration-100 ease-out active:scale-95 outline-none flex-shrink-0"
          style={{ width: `${metrics.icon * trashMagnificationScale}px` }}
        >
          {hoveredApp === TRASH_WINDOW_ID && !isResizingDock && (
            <DockTooltip label="Trash" lift={(trashMagnificationScale - 1) * metrics.icon} />
          )}
          <div
            className="relative flex items-center justify-center transition-transform duration-100 ease-out"
            style={{
              width: `${metrics.icon}px`,
              height: `${metrics.icon}px`,
              transform: `scale(${trashMagnificationScale})`,
              transformOrigin: "bottom center",
            }}
          >
            <TrashIcon
              aria-hidden
              className="h-full w-full object-contain [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.35))] pointer-events-none"
            />
          </div>
          <div className="rounded-full mt-1 opacity-0" style={{ width: `${metrics.dot}px`, height: `${metrics.dot}px` }} />
        </button>
        </div>
      </div>

      {openAppMenuApp && (
        <div
          ref={appMenuRef}
          role="menu"
          aria-label={`${openAppMenuApp.name} Dock menu`}
          className="fixed z-[90] min-w-40 -translate-x-1/2 rounded-lg border border-black/10 bg-white/95 py-1 text-xs shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-800/95"
          style={appMenuPosition}
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-full h-2 w-3 -translate-x-1/2 bg-white/95 [clip-path:polygon(0_0,100%_0,50%_100%)] dark:bg-zinc-800/95"
          />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              if (openAppMenuIsOpen) {
                closeWindow(openAppMenuApp.id);
              } else {
                handleAppClick(openAppMenuApp.id);
              }
              closeAppMenu();
            }}
            className="relative z-[1] flex w-full items-center px-3 py-1.5 text-left transition-colors can-hover:hover:bg-blue-500 can-hover:hover:text-white"
          >
            {openAppMenuIsOpen ? "Quit" : "Open"}
          </button>
        </div>
      )}
    </>
  );
}

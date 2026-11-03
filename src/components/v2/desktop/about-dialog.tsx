"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useRef, useEffect, useState, useCallback } from "react";
import { getAppById } from "@/lib/v2/app-config";
import { WindowControls } from "@/components/v2/desktop/window-controls";
import { APP_ICONS, BrandMark, type V2AppId } from "./app-icons";

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** An app to describe. Omit to describe the site itself. */
  appId?: string;
}

const SITE_DESCRIPTION = "Notes, photos and music, laid out like a desktop.";

export function AboutDialog({ isOpen, onClose, appId }: AboutDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Reset position when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPosition(null);
    }
  }, [isOpen]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      // Don't start drag if clicking on the close button
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }
      e.preventDefault();

      const dialogRect = dialogRef.current?.getBoundingClientRect();
      if (!dialogRect) return;

      setIsDragging(true);
      setDragOffset({
        x: e.clientX - dialogRect.left,
        y: e.clientY - dialogRect.top,
      });

      // Initialize position if not set
      if (position === null) {
        setPosition({
          x: dialogRect.left,
          y: dialogRect.top,
        });
      }
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Constrain to keep dialog on screen
      const dialogWidth = 288; // w-72 = 18rem = 288px
      const minX = 0;
      const maxX = window.innerWidth - dialogWidth;
      const minY = 28; // Below menu bar
      const maxY = window.innerHeight - 100;

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      });
    },
    [isDragging, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dialogRef.current && !dialogRef.current.contains(target)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true);
      document.addEventListener("keydown", handleEscape);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const app = appId ? getAppById(appId) : undefined;
  const Icon = app ? APP_ICONS[app.id as V2AppId] : undefined;

  // Determine positioning style
  const dialogStyle: React.CSSProperties = position
    ? {
        position: "fixed",
        left: position.x,
        top: position.y,
      }
    : {};

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[120px]">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative z-[101] w-72 rounded-xl bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
        style={dialogStyle}
      >
        {/* Window controls - drag handle area */}
        <div
          className="flex items-center gap-2 px-3 py-3 cursor-default select-none"
          onMouseDown={handleDragStart}
        >
          <WindowControls
            inShell={false}
            onClose={onClose}
            closeLabel="Close"
            closeOnly
          />
        </div>

        {/* Content */}
          <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-2 text-center">
          {Icon ? (
            <Icon aria-hidden className="h-16 w-16" />
          ) : (
            <BrandMark aria-hidden className="h-16 w-16 text-zinc-900 dark:text-white" />
          )}

          <div className="flex flex-col items-center gap-0.5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {app ? app.name : "Rishi Athanikar"}
            </h2>
            <p className="text-xs leading-[1.35] text-zinc-500 dark:text-white/70">
              {app ? "Part of the site of Rishi Athanikar." : SITE_DESCRIPTION}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

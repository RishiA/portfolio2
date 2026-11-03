"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useTheme } from "next-themes";
import { cn } from "@/lib/v2/utils";

type ThemeOption = "light" | "dark";

function DesktopPreview({ theme }: { theme: ThemeOption }) {
  const dark = theme === "dark";
  return (
    <div className="h-16 w-24 overflow-hidden rounded-lg border border-border">
      <div className={cn("flex h-full w-full flex-col", dark ? "bg-zinc-900" : "bg-white")}>
        <div className="flex-1 p-1.5">
          <div className={cn("flex h-full w-full flex-col rounded-sm p-1", dark ? "bg-zinc-800" : "bg-gray-100")}>
            <div className="mb-1 flex gap-0.5">
              <div className="h-1 w-1 rounded-full bg-red-400" />
              <div className="h-1 w-1 rounded-full bg-yellow-400" />
              <div className="h-1 w-1 rounded-full bg-green-400" />
            </div>
            <div className={cn("flex-1 rounded-sm", dark ? "bg-zinc-700" : "bg-white")} />
          </div>
        </div>
        <div className={cn("flex h-2.5 items-center justify-center gap-1 px-1", dark ? "bg-zinc-800" : "bg-gray-200")}>
          <div className={cn("h-1.5 w-1.5 rounded-sm", dark ? "bg-zinc-600" : "bg-gray-400")} />
          <div className={cn("h-1.5 w-1.5 rounded-sm", dark ? "bg-zinc-600" : "bg-gray-400")} />
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ theme, label, isSelected, onClick }: { theme: ThemeOption; label: string; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={label}
      className={cn("flex flex-col items-center gap-2 rounded-xl p-2 transition-all", isSelected && "ring-2 ring-blue-500")}
    >
      <DesktopPreview theme={theme} />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

export function AppearancePanel() {
  const { resolvedTheme, setTheme } = useTheme();
  const current: ThemeOption = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="space-y-4">
      <div data-setting-search-id="appearance" className="rounded-xl bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs">Appearance</span>
          <div className="flex gap-2">
            <ThemeCard theme="light" label="Light" isSelected={current === "light"} onClick={() => setTheme("light")} />
            <ThemeCard theme="dark" label="Dark" isSelected={current === "dark"} onClick={() => setTheme("dark")} />
          </div>
        </div>
      </div>
    </div>
  );
}

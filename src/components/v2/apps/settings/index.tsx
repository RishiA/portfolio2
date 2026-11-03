"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useCallback, useEffect, useRef, useState } from "react";
import type { V2AppProps } from "@/components/v2/apps/types";
import {
  consumePendingSettingsCategory,
  onSettingsCategoryRequest,
  type SettingsCategory
} from "@/lib/v2/settings/navigation";
import type { SettingsSearchItem } from "@/lib/v2/settings/search-items";
import { getCategory } from "./categories";
import { Content } from "./content";
import { Nav } from "./nav";
import { Sidebar } from "./sidebar";

interface History {
  entries: SettingsCategory[];
  index: number;
}

export default function SettingsApp({ isMobile = false }: V2AppProps) {
  const inShell = !isMobile;
  const appRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<History>({ entries: ["appearance"], index: 0 });
  const [highlightedSettingId, setHighlightedSettingId] = useState<string | null>(null);
  const [highlightRequestId, setHighlightRequestId] = useState(0);

  const selectedCategory = history.entries[history.index];

  const navigate = useCallback((category: SettingsCategory) => {
    setHistory((current) => {
      if (current.entries[current.index] === category) return current;
      const entries = [...current.entries.slice(0, current.index + 1), category];
      return { entries, index: entries.length - 1 };
    });
  }, []);

  useEffect(() => {
    const pending = consumePendingSettingsCategory();
    if (pending) navigate(pending);
    return onSettingsCategoryRequest(navigate);
  }, [navigate]);

  const handleCategorySelect = (category: SettingsCategory) => {
    setHighlightedSettingId(null);
    navigate(category);
  };

  const handleSearchResultSelect = (item: SettingsSearchItem) => {
    navigate(item.category);
    setHighlightedSettingId(item.id);
    setHighlightRequestId((requestId) => requestId + 1);
  };

  useEffect(() => {
    if (!highlightedSettingId) return;

    const frame = window.requestAnimationFrame(() => {
      const target = appRef.current?.querySelector<HTMLElement>(`[data-setting-search-id="${highlightedSettingId}"]`);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.animate(
        [{ boxShadow: "0 0 0 2px rgb(10 124 255 / 0.8)" }, { boxShadow: "0 0 0 2px rgb(10 124 255 / 0)" }],
        { duration: 1400, easing: "ease-out" }
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [highlightedSettingId, highlightRequestId, selectedCategory]);

  const step = (delta: 1 | -1) => {
    setHighlightedSettingId(null);
    setHistory((current) => ({ ...current, index: current.index + delta }));
  };

  return (
    <div
      ref={appRef}
      className="relative flex h-full flex-col overflow-hidden bg-background"
      data-app="settings"
      data-testid="app-window-settings"
    >
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onSearchResultSelect={handleSearchResultSelect}
          isDesktop={inShell}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Nav
            canGoBack={history.index > 0}
            canGoForward={history.index < history.entries.length - 1}
            onBack={() => step(-1)}
            onForward={() => step(1)}
            isDesktop={inShell}
            title={getCategory(selectedCategory).name}
          />
          <Content selectedCategory={selectedCategory} />
        </div>
      </div>
    </div>
  );
}

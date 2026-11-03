"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import React, { createContext, useContext, useState, useCallback } from "react";
import { DOCK_SHOW_OPEN_INDICATORS_STORAGE_KEY, parseShowDockIndicators } from "./dock-preferences";

export type ClockStyle = "digital" | "analog";

interface SystemSettingsContextValue {
  menuBarBackground: boolean;
  setMenuBarBackground: (show: boolean) => void;
  clockShowDate: boolean;
  setClockShowDate: (show: boolean) => void;
  clockShowDayOfWeek: boolean;
  setClockShowDayOfWeek: (show: boolean) => void;
  clockStyle: ClockStyle;
  setClockStyle: (style: ClockStyle) => void;
  clockShowAmPm: boolean;
  setClockShowAmPm: (show: boolean) => void;
  clockFlashSeparators: boolean;
  setClockFlashSeparators: (flash: boolean) => void;
  clockShowSeconds: boolean;
  setClockShowSeconds: (show: boolean) => void;
  showDockIndicators: boolean;
  setShowDockIndicators: (show: boolean) => void;
  /** Custom wallpaper image. When null the default gradient is shown. */
  wallpaperUrl: string | null;
  setWallpaperUrl: (url: string | null) => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextValue | null>(null);

const MENU_BAR_BACKGROUND_KEY = "menu-bar-show-background";
const CLOCK_SHOW_DATE_KEY = "menu-bar-clock-show-date";
const CLOCK_SHOW_DAY_KEY = "menu-bar-clock-show-day";
const CLOCK_STYLE_KEY = "menu-bar-clock-style";
const CLOCK_SHOW_AM_PM_KEY = "menu-bar-clock-show-am-pm";
const CLOCK_FLASH_SEPARATORS_KEY = "menu-bar-clock-flash-separators";
const CLOCK_SHOW_SECONDS_KEY = "menu-bar-clock-show-seconds";
const WALLPAPER_URL_KEY = "desktop-custom-wallpaper";

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Storage can be unavailable; the setting still applies for this page.
  }
}

/** A setting held in React state and mirrored to localStorage. */
function usePersistedSetting<T>(
  key: string,
  parse: (stored: string | null) => T,
  serialize: (value: T) => string | null
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => parse(readStorage(key)));
  const update = useCallback(
    (next: T) => {
      setValue(next);
      writeStorage(key, serialize(next));
    },
    [key, serialize]
  );
  return [value, update];
}

const parseBooleanDefaultTrue = (stored: string | null) => stored !== "false";
const parseBooleanDefaultFalse = (stored: string | null) => stored === "true";
const serializeBoolean = (value: boolean) => String(value);
const parseClockStyle = (stored: string | null): ClockStyle => (stored === "analog" ? "analog" : "digital");
const serializeString = (value: string) => value;
const parseWallpaperUrl = (stored: string | null) => stored || null;
const serializeNullableString = (value: string | null) => value;

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const [menuBarBackground, setMenuBarBackground] = usePersistedSetting(
    MENU_BAR_BACKGROUND_KEY,
    parseBooleanDefaultFalse,
    serializeBoolean
  );
  const [clockShowDate, setClockShowDate] = usePersistedSetting(
    CLOCK_SHOW_DATE_KEY,
    parseBooleanDefaultTrue,
    serializeBoolean
  );
  const [clockShowDayOfWeek, setClockShowDayOfWeek] = usePersistedSetting(
    CLOCK_SHOW_DAY_KEY,
    parseBooleanDefaultTrue,
    serializeBoolean
  );
  const [clockStyle, setClockStyle] = usePersistedSetting(CLOCK_STYLE_KEY, parseClockStyle, serializeString);
  const [clockShowAmPm, setClockShowAmPm] = usePersistedSetting(
    CLOCK_SHOW_AM_PM_KEY,
    parseBooleanDefaultTrue,
    serializeBoolean
  );
  const [clockFlashSeparators, setClockFlashSeparators] = usePersistedSetting(
    CLOCK_FLASH_SEPARATORS_KEY,
    parseBooleanDefaultFalse,
    serializeBoolean
  );
  const [clockShowSeconds, setClockShowSeconds] = usePersistedSetting(
    CLOCK_SHOW_SECONDS_KEY,
    parseBooleanDefaultFalse,
    serializeBoolean
  );
  const [showDockIndicators, setShowDockIndicators] = usePersistedSetting(
    DOCK_SHOW_OPEN_INDICATORS_STORAGE_KEY,
    parseShowDockIndicators,
    serializeBoolean
  );
  const [wallpaperUrl, setWallpaperUrl] = usePersistedSetting(
    WALLPAPER_URL_KEY,
    parseWallpaperUrl,
    serializeNullableString
  );

  return (
    <SystemSettingsContext.Provider
      value={{
        menuBarBackground,
        setMenuBarBackground,
        clockShowDate,
        setClockShowDate,
        clockShowDayOfWeek,
        setClockShowDayOfWeek,
        clockStyle,
        setClockStyle,
        clockShowAmPm,
        setClockShowAmPm,
        clockFlashSeparators,
        setClockFlashSeparators,
        clockShowSeconds,
        setClockShowSeconds,
        showDockIndicators,
        setShowDockIndicators,
        wallpaperUrl,
        setWallpaperUrl
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings(): SystemSettingsContextValue {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error("useSystemSettings must be used within a SystemSettingsProvider");
  }
  return context;
}

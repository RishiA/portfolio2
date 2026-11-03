"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useEffect, useState, useCallback } from "react";
import { useWindowManager } from "@/lib/v2/window-context";
import { getAppById } from "@/lib/v2/app-config";
import { cn } from "@/lib/v2/utils";
import { SiteMenu } from "./site-menu";
import { BatteryStatus, WifiStatus } from "./status-menus";
import { AppMenu } from "./app-menu";
import { AboutDialog } from "./about-dialog";
import { BrandMark } from "./app-icons";
import { useSystemSettings } from "@/lib/v2/system-settings-context";
import { getDelayUntilNextClockRefresh, getMenuBarClockRefreshMs } from "@/lib/v2/menu-bar-clock";

type OpenMenu = "site" | "appMenu" | null;

function AnalogClock({ date }: { date: Date }) {
  const minuteAngle = date.getMinutes() * 6;
  const hourAngle = (date.getHours() % 12) * 30 + date.getMinutes() * 0.5;

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 3.5v1M10 15.5v1M3.5 10h1M15.5 10h1" stroke="currentColor" strokeWidth="1" />
      <path d="M10 10V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${hourAngle} 10 10)`} />
      <path d="M10 10V4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" transform={`rotate(${minuteAngle} 10 10)`} />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

interface MenuBarProps {
  onOpenSettings: () => void;
}

export function MenuBar({ onOpenSettings }: MenuBarProps) {
  const {
    menuBarBackground,
    clockShowDate,
    clockShowDayOfWeek,
    clockStyle,
    clockShowAmPm,
    clockFlashSeparators,
    clockShowSeconds,
  } = useSystemSettings();
  const { getFocusedAppId, closeWindow, setMenuOpen } = useWindowManager();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [datePrefix, setDatePrefix] = useState<string>("");
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [aboutTarget, setAboutTarget] = useState<{ appId?: string } | null>(null);

  // Sync menu open state to window context (used to prevent window focus when menu is open)
  useEffect(() => {
    setMenuOpen(!!openMenu);
  }, [openMenu, setMenuOpen]);

  const focusedAppId = getFocusedAppId();
  const focusedApp = focusedAppId ? getAppById(focusedAppId) : null;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateParts = [
        clockShowDayOfWeek
          ? now.toLocaleDateString("en-US", { weekday: "short" })
          : null,
        clockShowDate
          ? now.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : null,
      ].filter(Boolean);
      const timeParts = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: clockShowSeconds ? "2-digit" : undefined,
        hour12: true,
      }).formatToParts(now);
      let time = timeParts
        .filter((part) => clockShowAmPm || part.type !== "dayPeriod")
        .map((part) => part.value)
        .join("")
        .trim();

      if (
        clockStyle === "digital" &&
        clockFlashSeparators &&
        Math.floor(now.getMilliseconds() / 500) % 2
      ) {
        time = time.replaceAll(":", " ");
      }

      const prefix = dateParts.join(" ");
      setCurrentDate(now);
      setDatePrefix(prefix);
      setCurrentTime(prefix ? `${prefix} ${time}` : time);
    };

    updateTime();
    const refreshMs = getMenuBarClockRefreshMs({
      clockStyle,
      flashSeparators: clockFlashSeparators,
      showSeconds: clockShowSeconds,
    });
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleNextUpdate = () => {
      timeout = setTimeout(() => {
        updateTime();
        scheduleNextUpdate();
      }, getDelayUntilNextClockRefresh(Date.now(), refreshMs));
    };

    scheduleNextUpdate();
    return () => clearTimeout(timeout);
  }, [
    clockFlashSeparators,
    clockShowAmPm,
    clockShowDate,
    clockShowDayOfWeek,
    clockShowSeconds,
    clockStyle,
  ]);

  const quitFocusedApp = useCallback(() => {
    if (!focusedAppId) return;
    closeWindow(focusedAppId);
  }, [focusedAppId, closeWindow]);

  // Q shortcut to quit the focused app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key.toLowerCase() === "q" && !e.metaKey && !e.ctrlKey && !e.altKey && focusedAppId) {
        e.preventDefault();
        quitFocusedApp();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedAppId, quitFocusedApp]);

  const toggleMenu = (menu: OpenMenu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  return (
    <div
      data-testid="menu-bar"
      className={cn(
        "fixed top-0 left-0 right-0 h-7 flex items-center justify-between px-4 z-[70] select-none",
        menuBarBackground && "border-b border-white/10 bg-white/55 backdrop-blur-md dark:bg-black/55"
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleMenu("site")}
          aria-label="Site menu"
          className={cn(
            "flex items-center justify-center w-6 h-5 -ml-1 rounded transition-colors",
            openMenu === "site" ? "bg-blue-500" : "can-hover:hover:bg-white/10"
          )}
        >
          <BrandMark
            aria-hidden
            className={cn("w-4 h-4", openMenu === "site" ? "text-white" : "text-black dark:text-white")}
          />
        </button>
        <div data-testid="menu-bar-app-commands" className="flex items-center gap-1">
          <button
            onClick={() => toggleMenu("appMenu")}
            className={cn(
              "text-sm font-semibold px-2 py-0.5 rounded transition-colors",
              openMenu === "appMenu"
                ? "bg-blue-500 text-white"
                : "text-black dark:text-white can-hover:hover:bg-white/10"
            )}
          >
            {focusedApp?.menuBarTitle || "Desktop"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <BatteryStatus />
        <WifiStatus />

        <div
          aria-label={currentDate ? currentDate.toLocaleString("en-US") : "Date and time"}
          data-testid="menu-bar-clock"
          className="flex items-center gap-1.5 text-sm px-2 py-0.5 rounded ml-1 text-black dark:text-white"
        >
          {clockStyle === "analog" && currentDate ? (
            <>
              {datePrefix && <span>{datePrefix}</span>}
              <AnalogClock date={currentDate} />
            </>
          ) : (
            currentTime
          )}
        </div>
      </div>

      <SiteMenu
        isOpen={openMenu === "site"}
        onClose={closeMenu}
        onAboutThisSite={() => setAboutTarget({})}
        onSystemSettings={onOpenSettings}
      />

      {focusedApp && (
        <AppMenu
          isOpen={openMenu === "appMenu"}
          onClose={closeMenu}
          appName={focusedApp.menuBarTitle}
          onAbout={() => setAboutTarget({ appId: focusedApp.id })}
          onQuit={quitFocusedApp}
        />
      )}

      <AboutDialog isOpen={aboutTarget !== null} onClose={() => setAboutTarget(null)} appId={aboutTarget?.appId} />
    </div>
  );
}

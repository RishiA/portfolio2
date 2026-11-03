import { describe, expect, it } from "vitest";
import { APPS, WINDOWED_APPS, getAppById, clampAppWindowSize } from "@/lib/v2/app-config";
import { getMobileShellFallbackAppId, isAppSupportedOnMobile } from "@/lib/v2/app-availability";

describe("v2 app config", () => {
  it("has exactly five apps in Dock order", () => {
    expect(APPS.map((app) => app.id)).toEqual(["notes", "terminal", "photos", "music", "settings"]);
  });

  it("names each app for the menu bar", () => {
    expect(APPS.map((app) => app.menuBarTitle)).toEqual(["Notes", "Terminal", "Photos", "Music", "Settings"]);
  });

  it("adds Trash as a window but not as an app", () => {
    expect(WINDOWED_APPS.map((app) => app.id)).toEqual([...APPS.map((app) => app.id), "trash"]);
    expect(getAppById("trash")?.menuBarTitle).toBe("Trash");
    expect(APPS.map((app) => String(app.id))).not.toContain("trash");
  });

  it("clamps window sizes to the app minimum", () => {
    expect(clampAppWindowSize("photos", { width: 100, height: 100 })).toEqual({ width: 960, height: 450 });
  });

  it("falls back to Notes for apps that do not run on phones", () => {
    expect(isAppSupportedOnMobile("music")).toBe(true);
    expect(isAppSupportedOnMobile("terminal")).toBe(false);
    expect(getMobileShellFallbackAppId("terminal")).toBe("notes");
    expect(getMobileShellFallbackAppId("settings")).toBe("notes");
    expect(getMobileShellFallbackAppId("photos")).toBe("photos");
  });
});

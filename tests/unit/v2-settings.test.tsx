import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_WALLPAPER,
  gradientCssValue,
  parseWallpaper,
  serializeWallpaper,
  wallpaperCssValue
} from "@/lib/v2/settings/wallpapers";
import { getNextSettingsSearchResultIndex, searchSettings } from "@/lib/v2/settings/search-items";
import { SystemSettingsProvider, useSystemSettings } from "@/lib/v2/system-settings-context";

describe("wallpaper setting", () => {
  it("defaults to the dawn gradient", () => {
    expect(parseWallpaper(null)).toEqual(DEFAULT_WALLPAPER);
    expect(parseWallpaper("")).toEqual({ kind: "gradient", id: "dawn" });
  });

  it("reads gradient and photo values", () => {
    expect(parseWallpaper("gradient:lagoon")).toEqual({ kind: "gradient", id: "lagoon" });
    expect(parseWallpaper("photo:https://cdn.sanity.io/a.jpg")).toEqual({ kind: "photo", url: "https://cdn.sanity.io/a.jpg" });
  });

  it("still reads a bare image URL saved by an earlier version", () => {
    expect(parseWallpaper("https://cdn.sanity.io/a.jpg")).toEqual({ kind: "photo", url: "https://cdn.sanity.io/a.jpg" });
  });

  it("falls back to the default for bad stored values", () => {
    for (const bad of ["gradient:nope", "photo:javascript:alert(1)", "photo:", "banana", "gradient:"]) {
      expect(parseWallpaper(bad)).toEqual(DEFAULT_WALLPAPER);
    }
  });

  it("round-trips through serialize", () => {
    const photo = { kind: "photo", url: "https://cdn.sanity.io/a.jpg" } as const;
    expect(parseWallpaper(serializeWallpaper(photo))).toEqual(photo);
    expect(parseWallpaper(serializeWallpaper({ kind: "gradient", id: "dusk" }))).toEqual({ kind: "gradient", id: "dusk" });
    expect(serializeWallpaper(DEFAULT_WALLPAPER)).toBeNull();
  });

  it("builds the CSS background for each kind", () => {
    expect(wallpaperCssValue({ kind: "gradient", id: "meadow" })).toBe(gradientCssValue("meadow"));
    expect(wallpaperCssValue({ kind: "photo", url: "https://x/y.jpg" })).toBe('url("https://x/y.jpg")');
  });
});

describe("wallpaper in the settings provider", () => {
  beforeEach(() => window.localStorage.clear());

  function renderSettings() {
    let current!: ReturnType<typeof useSystemSettings>;
    function Probe() {
      current = useSystemSettings();
      return null;
    }
    render(
      <SystemSettingsProvider>
        <Probe />
      </SystemSettingsProvider>
    );
    return () => current;
  }

  it("persists a chosen gradient and a chosen photo", () => {
    const get = renderSettings();
    act(() => get().setWallpaper({ kind: "gradient", id: "lagoon" }));
    expect(window.localStorage.getItem("desktop-custom-wallpaper")).toBe("gradient:lagoon");
    act(() => get().setWallpaper({ kind: "photo", url: "https://cdn.sanity.io/a.jpg" }));
    expect(window.localStorage.getItem("desktop-custom-wallpaper")).toBe("photo:https://cdn.sanity.io/a.jpg");
    act(() => get().setWallpaper(DEFAULT_WALLPAPER));
    expect(window.localStorage.getItem("desktop-custom-wallpaper")).toBeNull();
  });

  it("restores a saved wallpaper on load", () => {
    window.localStorage.setItem("desktop-custom-wallpaper", "gradient:dusk");
    expect(renderSettings()().wallpaper).toEqual({ kind: "gradient", id: "dusk" });
  });

  it("uses the default when the stored value is bad", () => {
    window.localStorage.setItem("desktop-custom-wallpaper", "gradient:missing");
    expect(renderSettings()().wallpaper).toEqual(DEFAULT_WALLPAPER);
  });
});

describe("settings search", () => {
  it("returns nothing for an empty query", () => {
    expect(searchSettings("   ")).toEqual([]);
  });

  it("matches labels and keywords, ignoring case", () => {
    expect(searchSettings("DARK").map((item) => item.id)).toEqual(["appearance"]);
    expect(searchSettings("seconds").map((item) => item.id)).toEqual(["clock"]);
    expect(searchSettings("dots").map((item) => item.id)).toEqual(["dock-indicators"]);
  });

  it("finds nothing for settings that were dropped", () => {
    expect(searchSettings("bluetooth")).toEqual([]);
    expect(searchSettings("wi-fi")).toEqual([]);
  });

  it("wraps the highlighted result index", () => {
    expect(getNextSettingsSearchResultIndex(0, 3, -1)).toBe(2);
    expect(getNextSettingsSearchResultIndex(2, 3, 1)).toBe(0);
    expect(getNextSettingsSearchResultIndex(0, 0, 1)).toBe(0);
  });
});

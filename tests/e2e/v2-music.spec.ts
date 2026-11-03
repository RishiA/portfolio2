import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const FIXTURES = path.join(__dirname, "fixtures", "music");
const FIXTURE_ORIGIN = "https://music-fixtures.test";
const playlistsFixture = readFileSync(path.join(FIXTURES, "playlists.json"), "utf8");

type WindowWithAudio = { __audios?: HTMLAudioElement[] };

/** Serves playlists, cover art and a silent clip from local fixtures. Nothing leaves the machine. */
async function mockMusic(page: Page, body: string = playlistsFixture) {
  await page.route("**/api/v2/music", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body })
  );
  await page.route(`${FIXTURE_ORIGIN}/**`, (route) => {
    const file = new URL(route.request().url()).pathname.slice(1);
    return route.fulfill({
      status: 200,
      contentType: file.endsWith(".wav") ? "audio/wav" : "image/png",
      body: readFileSync(path.join(FIXTURES, file))
    });
  });
}

/** Records each Audio element the app creates so tests can read its real state. */
async function trackAudioElements(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as WindowWithAudio;
    w.__audios = [];
    const NativeAudio = window.Audio;
    window.Audio = function (this: unknown, ...args: ConstructorParameters<typeof Audio>) {
      const audio = new NativeAudio(...args);
      w.__audios?.push(audio);
      return audio;
    } as unknown as typeof Audio;
  });
}

const audioCount = (page: Page) => page.evaluate(() => (window as unknown as WindowWithAudio).__audios?.length ?? 0);
const audioIsPlaying = (page: Page) =>
  page.evaluate(() => {
    const audio = (window as unknown as WindowWithAudio).__audios?.[0];
    return Boolean(audio && !audio.paused && audio.currentTime > 0);
  });

test.describe("v2 music", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("opens a playlist, plays a track and keeps playing when the window loses focus or closes", async ({ page }) => {
    await mockMusic(page);
    await trackAudioElements(page);
    await page.goto("/v2/music");

    const music = page.getByTestId("app-window-music");
    await expect(music).toBeVisible();
    await expect(music.getByRole("heading", { name: "Playlists" })).toBeVisible();
    expect(await audioCount(page)).toBe(0);
    await expect(page.getByTestId("music-now-playing")).toHaveCount(0);

    await music.getByRole("button", { name: "🚗 Road Trip" }).click();
    await expect(music.getByRole("heading", { name: "🚗 Road Trip" })).toBeVisible();
    await expect(music.getByText("3 songs, 10 min")).toBeVisible();

    await music.getByText("Morning Static").click();
    const bar = page.getByTestId("music-now-playing");
    await expect(bar).toContainText("Morning Static");
    await expect(bar).toContainText("The Placeholders");
    await expect(bar.getByRole("button", { name: "Pause" })).toBeVisible();
    await expect.poll(() => audioIsPlaying(page)).toBe(true);

    await page.getByTestId("dock-app-notes").click();
    await expect(page).toHaveURL(/\/v2\/notes$/);
    await expect(page.getByTestId("app-window-notes")).toBeVisible();
    expect(await audioCount(page)).toBe(1);
    expect(await audioIsPlaying(page)).toBe(true);

    await page.getByTestId("dock-app-music").click();
    await expect(page.getByTestId("music-now-playing")).toContainText("Morning Static");

    await page.getByTestId("app-window-music").getByRole("button", { name: "Close window" }).click();
    await expect(page.getByTestId("app-window-music")).toHaveCount(0);
    expect(await audioIsPlaying(page)).toBe(true);

    await page.getByTestId("dock-app-music").click();
    await expect(page.getByTestId("music-now-playing")).toContainText("Morning Static");
    await expect(page.getByTestId("music-now-playing").getByRole("button", { name: "Pause" })).toBeVisible();
    expect(await audioCount(page)).toBe(1);
  });

  test("pauses, skips and keeps tracks without a preview unplayable", async ({ page }) => {
    await mockMusic(page);
    await page.goto("/v2/music");
    const music = page.getByTestId("app-window-music");

    await music.getByRole("button", { name: "🌙 Late Night" }).click();
    await music.getByText("Green Room").click();
    const bar = page.getByTestId("music-now-playing");
    await expect(bar).toContainText("Green Room");

    await bar.getByRole("button", { name: "Pause" }).click();
    await expect(bar.getByRole("button", { name: "Play", exact: true })).toBeVisible();

    await music.getByText("No Preview Available").click();
    await expect(bar).toContainText("Green Room");

    await music.getByRole("button", { name: "Songs" }).click();
    await expect(music.getByRole("heading", { name: "Songs" })).toBeVisible();
    await expect(music.getByText("Blue Hour")).toBeVisible();
  });

  test("shows albums and artists built from the playlists", async ({ page }) => {
    await mockMusic(page);
    await page.goto("/v2/music");
    const music = page.getByTestId("app-window-music");

    await music.getByRole("button", { name: "Albums" }).click();
    await expect(music.getByText("Test Card")).toBeVisible();
    await expect(music.getByText("Fixtures", { exact: true })).toBeVisible();

    await music.getByRole("button", { name: "Artists" }).click();
    await expect(music.getByText("The Placeholders")).toBeVisible();
    await expect(music.getByText("Mock Ensemble")).toBeVisible();
    await expect(music.getByText("1 song", { exact: true })).toBeVisible();
  });

  test("shows the empty state with full chrome when there are no playlists", async ({ page }) => {
    await mockMusic(page, JSON.stringify({ version: 1, data: [] }));
    await page.goto("/v2/music");

    const music = page.getByTestId("app-window-music");
    await expect(music.getByTestId("music-empty-state")).toBeVisible();
    await expect(music.getByText("No Music Yet")).toBeVisible();
    await expect(music.getByRole("button", { name: "Home" })).toBeVisible();
    await expect(music.getByRole("button", { name: "Songs" })).toBeVisible();
    await expect(music.getByRole("button", { name: "Close window" })).toBeVisible();
    await expect(page.getByTestId("music-now-playing")).toHaveCount(0);
  });

  test("shows the empty state when the API fails", async ({ page }) => {
    await page.route("**/api/v2/music", (route) => route.fulfill({ status: 500, body: "{}" }));
    await page.goto("/v2/music");
    await expect(page.getByTestId("app-window-music")).toBeVisible();
    await expect(page.getByTestId("app-window-music").getByRole("button", { name: "Home" })).toBeVisible();
  });
});

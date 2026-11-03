import { expect, test } from "@playwright/test";
import { buildMockPhotos, mockPhotosApi } from "./photos-mocks";

test.describe("v2 Settings and Trash", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("switches to Dark and changes the desktop gradient", async ({ page }) => {
    await mockPhotosApi(page, []);
    await page.goto("/v2/settings");
    await expect(page.getByTestId("app-window-settings")).toBeVisible();
    await expect(page.getByTestId("settings-profile")).toContainText("Rishi Athanikar");

    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Wallpaper", exact: true }).click();
    await expect(page.getByTestId("wallpaper-photos-empty")).toContainText("Photos marked as wallpaper in the Studio appear here.");

    const wallpaper = page.locator("[data-desktop-wallpaper]");
    const before = await wallpaper.evaluate((el) => getComputedStyle(el).backgroundImage);
    await page.getByRole("button", { name: "Use Lagoon wallpaper" }).click();
    await expect(wallpaper).toHaveAttribute("data-desktop-wallpaper", "lagoon");
    const after = await wallpaper.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(after).not.toBe(before);

    await page.reload();
    await expect(page.locator("[data-desktop-wallpaper]")).toHaveAttribute("data-desktop-wallpaper", "lagoon");
  });

  test("toggles the Dock indicators", async ({ page }) => {
    await mockPhotosApi(page, []);
    await page.goto("/v2/settings");
    await page.getByRole("button", { name: "Desktop & Dock" }).click();
    const toggle = page.getByRole("switch", { name: "Show indicators for open applications" });
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    expect(await page.evaluate(() => window.localStorage.getItem("dock-show-open-indicators"))).toBe("false");
  });

  test("finds a setting with search", async ({ page }) => {
    await mockPhotosApi(page, []);
    await page.goto("/v2/settings");
    await page.getByLabel("Search settings").fill("clock");
    await page.getByTestId("settings-search-results").getByRole("button", { name: /Clock Options/ }).click();
    await expect(page.getByRole("button", { name: /Clock Options/ })).toBeVisible();
  });

  test("uses a photo marked as wallpaper", async ({ page }) => {
    const photos = buildMockPhotos().map((photo, index) => ({ ...photo, useAsWallpaper: index === 0 }));
    await mockPhotosApi(page, photos);
    await page.goto("/v2/settings");
    await page.getByRole("button", { name: "Wallpaper", exact: true }).click();

    const wallpaperPhoto = photos[0];
    await expect(page.getByRole("button", { name: `Use ${wallpaperPhoto.alt} as wallpaper` })).toHaveCount(1);
    await page.getByRole("button", { name: `Use ${wallpaperPhoto.alt} as wallpaper` }).click();
    await expect(page.locator("[data-desktop-wallpaper]")).toHaveAttribute("data-desktop-wallpaper", "photo");
    const background = await page.locator("[data-desktop-wallpaper]").evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(background).toContain(wallpaperPhoto.viewerUrl);
  });

  test("opens Settings on the Wallpaper panel from the desktop context menu", async ({ page }) => {
    await mockPhotosApi(page, []);
    await page.goto("/v2/notes");
    await page.locator("[data-desktop-wallpaper]").click({ button: "right", position: { x: 40, y: 400 } });
    await page.getByText("Change Wallpaper…").click();
    await expect(page.getByTestId("settings-wallpaper-panel")).toBeVisible();
  });

  test("opens Trash from the Dock and lists the items", async ({ page }) => {
    await page.goto("/v2/notes");
    await page.getByTestId("dock-app-trash").click();
    await expect(page.getByTestId("app-window-trash")).toBeVisible();
    await expect(page.getByTestId("trash-item")).toHaveCount(6);
    await expect(page.getByText("roadmap-final-v7-FINAL.key")).toBeVisible();

    await page.getByText("roadmap-final-v7-FINAL.key").click();
    await expect(page.getByTestId("trash-status")).toHaveText("Version 8 is already in review.");

    await page.getByRole("button", { name: "Empty", exact: true }).click();
    await page.getByRole("button", { name: "Empty Trash" }).click();
    await expect(page.getByTestId("trash-empty")).toBeVisible();
  });
});

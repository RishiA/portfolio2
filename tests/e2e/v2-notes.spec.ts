import { expect, test } from "@playwright/test";

const notesWindow = (page: import("@playwright/test").Page) => page.getByTestId("app-window-notes");

test.describe("v2 Notes on desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("opens with About me selected and its body showing", async ({ page }) => {
    await page.goto("/v2");

    const window = notesWindow(page);
    await expect(window.getByRole("heading", { level: 1, name: /About me/ })).toBeVisible();
    await expect(window.getByRole("navigation", { name: "Notes list" }).getByText("Pinned")).toBeVisible();
    await expect(window.locator("li", { has: page.getByRole("heading", { name: /About me/ }) })).toHaveClass(/bg-\[#FFE390\]/);
    await expect(window.locator(".v2-notes-body p").first()).toBeVisible();
    await expect(page).toHaveURL(/\/v2\/notes\/about-me$/);
  });

  test("searches, opens a result and updates the URL without a reload", async ({ page }) => {
    await page.goto("/v2");
    await expect(notesWindow(page).getByRole("heading", { level: 1 })).toBeVisible();
    await page.evaluate(() => {
      (window as unknown as { __noReload: boolean }).__noReload = true;
    });

    await notesWindow(page).getByRole("textbox", { name: "Search notes" }).fill("rho");
    const result = notesWindow(page).getByRole("heading", { level: 2, name: "Rho", exact: true });
    await expect(result).toBeVisible();
    await result.click();

    await expect(notesWindow(page).getByRole("heading", { level: 1, name: "Rho" })).toBeVisible();
    await expect(page).toHaveURL(/\/v2\/notes\/rho$/);
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);
  });

  test("moves the selection with the arrow keys", async ({ page }) => {
    await page.goto("/v2/notes/about-me");
    await expect(notesWindow(page).getByRole("heading", { level: 1, name: /About me/ })).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await expect(notesWindow(page).getByRole("heading", { level: 1, name: /Proof of work/ })).toBeVisible();
    await expect(page).toHaveURL(/\/v2\/notes\/proof-of-work$/);
  });

  test("opens a landing note directly and selects linked notes in the same window", async ({ page }) => {
    await page.goto("/v2/notes/proof-of-work");
    const window = notesWindow(page);
    await expect(window.getByRole("heading", { level: 1, name: /Proof of work/ })).toBeVisible();

    await page.evaluate(() => {
      (window as unknown as { __noReload: boolean }).__noReload = true;
    });
    await window.locator(".v2-notes-body").getByRole("link", { name: "Rho", exact: true }).click();

    await expect(window.getByRole("heading", { level: 1, name: "Rho" })).toBeVisible();
    await expect(page).toHaveURL(/\/v2\/notes\/rho$/);
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);
  });

  test("shows the v2 not-found page for an unknown note", async ({ page }) => {
    const response = await page.goto("/v2/notes/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  });

  test("loads notes when Notes opens from another route", async ({ page }) => {
    await page.goto("/v2/music");
    await page.getByTestId("dock-app-notes").click();

    await expect(notesWindow(page).getByRole("heading", { level: 1, name: /About me/ })).toBeVisible();
    await expect(page).toHaveURL(/\/v2\/notes\/about-me$/);
  });
});

test.describe("v2 Notes on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("shows the list first, then the note with a back button", async ({ page }) => {
    await page.goto("/v2/notes");
    const window = notesWindow(page);

    await expect(window.getByRole("navigation", { name: "Notes list" })).toBeVisible();
    await expect(window.getByRole("heading", { level: 1 })).toHaveCount(0);

    await window.getByRole("heading", { level: 2, name: /About me/ }).click();
    await expect(window.getByRole("heading", { level: 1, name: /About me/ })).toBeVisible();
    await expect(page).toHaveURL(/\/v2\/notes\/about-me$/);

    await window.getByRole("button", { name: "Notes" }).click();
    await expect(window.getByRole("navigation", { name: "Notes list" })).toBeVisible();
    await expect(page).toHaveURL(/\/v2\/notes$/);
  });

  test("opens a note straight from its URL", async ({ page }) => {
    await page.goto("/v2/notes/about-me");
    await expect(notesWindow(page).getByRole("heading", { level: 1, name: /About me/ })).toBeVisible();
    await expect(notesWindow(page).getByRole("button", { name: "Notes" })).toBeVisible();
  });
});

import { expect, test, type Page } from "@playwright/test";

const APP_NAMES = ["Notes", "Terminal", "Photos", "Music", "Settings"];

// Tailwind's base layer defines --tw-* custom properties on every element.
async function pageLoadsTailwind(page: Page) {
  return page.evaluate(() =>
    Array.from(document.styleSheets).some((sheet) => {
      try {
        return Array.from(sheet.cssRules).some((rule) => rule.cssText.includes("--tw-border-spacing-x"));
      } catch {
        return false;
      }
    })
  );
}

test.describe("v2 desktop shell", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("shows the menu bar, the Dock and the Notes window", async ({ page }) => {
    await page.goto("/v2");

    await expect(page.getByTestId("menu-bar")).toBeVisible();
    await expect(page.getByRole("button", { name: "Site menu" })).toBeVisible();
    await expect(page.getByTestId("menu-bar-app-commands")).toHaveText("Notes");

    for (const name of APP_NAMES) {
      await expect(page.getByTestId(`dock-app-${name.toLowerCase()}`)).toBeVisible();
    }
    await expect(page.getByTestId("dock-app-trash")).toBeVisible();
    await expect(page.getByRole("button", { name: "Resize Dock" })).toBeVisible();

    await expect(page.getByTestId("app-window-notes")).toBeVisible();
    await expect(page).toHaveURL(/\/v2\/notes$/);
  });

  test("switches to Music from the Dock without a reload", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/v2");
    await expect(page.getByTestId("app-window-notes")).toBeVisible();
    await page.evaluate(() => {
      (window as unknown as { __noReload: boolean }).__noReload = true;
    });

    await page.getByTestId("dock-app-music").click();

    await expect(page.getByTestId("app-window-music")).toBeVisible();
    await expect(page.getByTestId("menu-bar-app-commands")).toHaveText("Music");
    await expect(page).toHaveURL(/\/v2\/music$/);
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);

    await page.getByTestId("dock-app-notes").click();
    await expect(page).toHaveURL(/\/v2\/notes$/);
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);
    expect(errors).toEqual([]);
  });

  test("opens each deep link with its app focused", async ({ page }) => {
    await page.goto("/v2/photos");
    await expect(page.getByTestId("app-window-photos")).toBeVisible();
    await expect(page.getByTestId("menu-bar-app-commands")).toHaveText("Photos");
  });

  test("closing the focused window with the traffic light updates the menu bar", async ({ page }) => {
    await page.goto("/v2/settings");
    await expect(page.getByTestId("app-window-settings")).toBeVisible();

    await page.getByTestId("app-window-settings").getByRole("button", { name: "Close window" }).click();

    await expect(page.getByTestId("app-window-settings")).toHaveCount(0);
    await expect(page.getByTestId("menu-bar-app-commands")).toHaveText("Notes");
  });

  test("opens the Trash window from the Dock", async ({ page }) => {
    await page.goto("/v2");
    await page.getByTestId("dock-app-trash").click();

    await expect(page.getByTestId("app-window-trash")).toBeVisible();
    await expect(page.getByTestId("menu-bar-app-commands")).toHaveText("Trash");
  });

  test("keeps the v2 404 for unknown paths", async ({ page }) => {
    await page.goto("/v2/does-not-exist");
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  });
});

test.describe("v2 on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("shows one app with no menu bar or Dock, and Terminal falls back to Notes", async ({ page }) => {
    await page.goto("/v2/terminal");

    await expect(page.getByTestId("app-window-notes")).toBeVisible();
    await expect(page.getByTestId("menu-bar")).toHaveCount(0);
    await expect(page.getByTestId("dock-app-notes")).toHaveCount(0);
    await expect(page).toHaveURL(/\/v2\/notes$/);
  });
});

test.describe("Tailwind scope", () => {
  test("loads Tailwind on /v2 and not on the v1 pages", async ({ page }) => {
    await page.goto("/v2");
    await expect(page.getByTestId("menu-bar")).toBeVisible();
    expect(await pageLoadsTailwind(page)).toBe(true);

    for (const path of ["/", "/work"]) {
      await page.goto(path);
      expect(await pageLoadsTailwind(page)).toBe(false);
    }
  });
});

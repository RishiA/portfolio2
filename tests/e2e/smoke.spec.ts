import { expect, test } from "@playwright/test";

test("home renders and nav links are visible", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Hello, I'm Rishi." })).toBeVisible();
  await expect(page.getByRole("img", { name: "Sketch portrait of Rishi Athanikar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Work" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
});

test("theme toggle renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Toggle theme" })).toBeVisible();
});

test("subpages render primary navigation", async ({ page }) => {
  await page.goto("/work");
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
});

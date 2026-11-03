import { expect, test } from "@playwright/test";

test("/v2 redirects to the About me note", async ({ page }) => {
  await page.goto("/v2");
  await expect(page).toHaveURL(/\/v2\/notes\/about-me$/);
  await expect(page.getByRole("heading", { level: 1, name: /About me/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Notes", exact: true }).first()).toHaveAttribute("aria-current", "page");
});

test("collection filter, search and opening a result on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/v2/notes/about-me");

  await page.getByRole("button", { name: "Work" }).click();
  await expect(page.getByRole("link", { name: /Rho/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /About me/ })).toHaveCount(0);

  await page.getByRole("searchbox", { name: "Search notes" }).fill("rho");
  await expect(page.getByRole("status")).toContainText("result");
  await page.locator("[data-note-row]", { hasText: /Rho/ }).first().click();
  await expect(page).toHaveURL(/\/v2\/notes\/rho/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Rho");
  await expect(page.locator('[data-note-row][aria-current="page"]')).toHaveCount(1);
});

test("server-rendered search works as a plain form", async ({ page }) => {
  await page.goto("/v2/search?q=rho");
  await expect(page.getByRole("heading", { level: 1, name: "Search" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: /Rho/ }).first()).toBeVisible();
});

test("mobile: list and note are separate screens with a back link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/v2/notes");
  await expect(page.locator(".v2-reader")).toBeHidden();

  await page.locator("[data-note-row]", { hasText: "Proof of work" }).click();
  await expect(page).toHaveURL(/\/v2\/notes\/proof-of-work$/);
  await expect(page.locator(".v2-sidebar")).toBeHidden();

  await page.getByRole("link", { name: "Back to Notes" }).click();
  await expect(page).toHaveURL(/\/v2\/notes$/);
  await expect(page.locator(".v2-sidebar")).toBeVisible();
});

import { expect, test } from "@playwright/test";
import { mockPhotosApi } from "./photos-mocks";

test.describe("v2 Photos app", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("shows the grid and switches between Years, Months and All Photos", async ({ page }) => {
    await mockPhotosApi(page);
    await page.goto("/v2/photos");

    const window = page.getByTestId("app-window-photos");
    await expect(window).toBeVisible();
    await expect(page.getByRole("heading", { name: "Library" })).toBeVisible();
    await expect(page.getByTestId("photo-tile")).toHaveCount(6);

    await page.getByRole("button", { name: "years" }).click();
    await expect(page.getByRole("heading", { name: "2023" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "2024" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "2025" })).toBeVisible();

    await page.getByRole("button", { name: "months" }).click();
    await expect(page.getByRole("heading", { name: "March 2023" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "May 2025" })).toBeVisible();

    await page.getByRole("button", { name: "All Photos" }).click();
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(0);
    await expect(page.getByTestId("photo-tile")).toHaveCount(6);
  });

  test("filters by album and favorites", async ({ page }) => {
    await mockPhotosApi(page);
    await page.goto("/v2/photos");

    await page.getByRole("button", { name: "People", exact: true }).click();
    await expect(page.getByTestId("photo-tile")).toHaveCount(2);

    await page.getByRole("button", { name: "Library", exact: true }).click();
    await page.getByTestId("photo-tile").first().hover();
    await page.getByTestId("photo-tile").first().getByRole("button").click();
    await page.getByRole("button", { name: "Favorites", exact: true }).click();
    await expect(page.getByTestId("photo-tile")).toHaveCount(1);
  });

  test("opens the viewer, moves to the next photo with the arrow key and closes with Escape", async ({ page }) => {
    await mockPhotosApi(page);
    await page.goto("/v2/photos");

    await page.getByTestId("photo-tile").first().dblclick();
    await expect(page.getByText("1 of 6")).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to photo grid" })).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByText("2 of 6")).toBeVisible();

    await page.getByRole("button", { name: "Show photo information" }).click();
    await expect(page.getByRole("complementary", { name: "Photo information" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("2 of 6")).toHaveCount(0);
    await expect(page.getByTestId("photo-tile")).toHaveCount(6);
  });

  test("shows the empty state with the full chrome when there are no photos", async ({ page }) => {
    await mockPhotosApi(page, []);
    await page.goto("/v2/photos");

    await expect(page.getByTestId("photos-empty")).toHaveText("No photos yet");
    await expect(page.getByRole("heading", { name: "Library" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Favorites", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "years" })).toBeVisible();
  });
});

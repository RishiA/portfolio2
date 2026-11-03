import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });
test.setTimeout(60_000);

test("terminal window runs /help, completes with Tab and opens a note in the Notes window", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/api/me")) apiRequests.push(path);
  });
  let documentLoads = 0;
  page.on("request", (request) => {
    if (request.resourceType() === "document") documentLoads += 1;
  });

  await page.goto("/v2/terminal");
  const windowEl = page.getByTestId("app-window-terminal");
  await expect(windowEl).toBeVisible();
  await expect(windowEl.getByText("rishi — zsh").first()).toBeVisible();
  await expect(windowEl.getByText("Type /help to see what you can do.")).toBeVisible();

  const input = page.getByRole("combobox", { name: "Command" });
  await input.fill("/help");
  await input.press("Enter");
  await expect(windowEl.getByText("Commands", { exact: true })).toBeVisible();

  await input.fill("/exp");
  await expect(page.getByRole("listbox")).toBeVisible();
  await input.press("Tab");
  await expect(input).toHaveValue("/experience");
  await input.press("Enter");

  const firstResult = page.getByRole("region", { name: "Output of /experience" }).getByRole("link").first();
  await expect(firstResult).toBeVisible({ timeout: 20_000 });
  expect(apiRequests).toContain("/api/me/experience");

  const href = await firstResult.getAttribute("href");
  expect(href).toMatch(/^\/v2\/notes\/[a-z0-9-]+$/);
  const loadsBeforeClick = documentLoads;
  await firstResult.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByTestId("app-window-notes")).toBeVisible();
  expect(documentLoads).toBe(loadsBeforeClick);
});

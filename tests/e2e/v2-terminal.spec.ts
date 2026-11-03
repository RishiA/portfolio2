import { expect, test } from "@playwright/test";

test("terminal runs /help and /experience and links to notes", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/api/me")) apiRequests.push(path);
  });

  await page.goto("/v2/terminal");
  const input = page.getByRole("combobox", { name: "Command" });
  await expect(page.getByText("Type a command or pick one below.")).toBeVisible();

  await input.fill("/help");
  await input.press("Enter");
  await expect(page.getByText("Commands", { exact: true })).toBeVisible();

  await input.fill("/experience");
  await input.press("Enter");
  const firstResult = page.getByRole("region", { name: "Output of /experience" }).getByRole("link").first();
  await expect(firstResult).toBeVisible();
  expect(apiRequests).toContain("/api/me/experience");

  const href = await firstResult.getAttribute("href");
  expect(href).toMatch(/^\/v2\/notes\/[a-z0-9-]+$/);
  await firstResult.click();
  // The notes route is built separately and may not exist on this branch.
  await expect(page).toHaveURL(new RegExp(`${href}$`));
});

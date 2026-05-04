import { expect, test } from "@playwright/test";

test("/work renders Timeline without client errors", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/work");
  await expect(page.getByRole("heading", { level: 2, name: "Proof of Work" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Work history" })).toBeVisible();

  expect.soft(pageErrors, `pageerror at /work:\n${pageErrors.join("\n")}`).toEqual([]);
  expect.soft(consoleErrors, `console error at /work:\n${consoleErrors.join("\n")}`).toEqual([]);
});

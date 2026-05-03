import { expect, test } from "@playwright/test";

const modes = ["segments", "facets", "transitions", "timeline", "filterless"] as const;

test("/work has no critical client errors across ui modes", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  for (const mode of modes) {
    pageErrors.length = 0;
    consoleErrors.length = 0;
    const path = mode === "segments" ? "/work" : `/work?ui=${mode}`;
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 2, name: "Proof of Work" })).toBeVisible();
    expect.soft(pageErrors, `pageerror at ${path}:\n${pageErrors.join("\n")}`).toEqual([]);
    expect.soft(consoleErrors, `console error at ${path}:\n${consoleErrors.join("\n")}`).toEqual([]);
  }

  await page.goto("/work?ui=segments");
  for (const label of ["Facets", "Transitions", "Timeline", "Filterless", "Segments"] as const) {
    pageErrors.length = 0;
    consoleErrors.length = 0;
    await page.getByRole("navigation", { name: "Filter interaction layout" }).getByRole("link", { name: label }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Proof of Work" })).toBeVisible();
    expect.soft(pageErrors, `pageerror after click ${label}:\n${pageErrors.join("\n")}`).toEqual([]);
    expect.soft(consoleErrors, `console error after click ${label}:\n${consoleErrors.join("\n")}`).toEqual([]);
  }
});

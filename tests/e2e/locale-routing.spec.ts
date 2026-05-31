import { test, expect } from "@playwright/test";

test("root redirects to /tr", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/tr$/);
});

test("language toggle switches locale", async ({ page }) => {
  await page.goto("/tr");
  await page.getByRole("link", { name: /english/i }).first().click();
  await expect(page).toHaveURL(/\/en/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("invalid locale 404s", async ({ page }) => {
  const res = await page.goto("/zz");
  expect(res?.status()).toBe(404);
});

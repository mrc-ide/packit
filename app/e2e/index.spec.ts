import { test, expect } from "@playwright/test";

test.describe(() => {
  test("can view packet group list", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("body")).toHaveText(/Manage Access/);
  });
});

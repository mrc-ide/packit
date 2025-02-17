import { test,  expect } from "@playwright/test";

test("packet group list", async({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toHaveText(/Manage Access/);
});
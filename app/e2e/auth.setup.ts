import { test as setup, expect } from "@playwright/test";

// Define "setup" as a dependency for any test project which requires prior authentication
setup("authenticate", async({ page }, testInfo) => {
    await page.goto("/");
    // Dev superuser credentials
    await page.getByLabel("Email").fill("resideUser@resideAdmin.ic.ac.uk");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: /Log in/i }).click();
    await expect(page.locator("body")).toHaveText(/Manage Access/);
    // write out context to tmp location to be picked up by dependent tests
    const authFile = testInfo.outputPath("auth.json");
    await page.context().storageState({path: authFile});
});
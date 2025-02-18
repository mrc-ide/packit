import { test as setup, expect } from "@playwright/test";

const authMethod = process.env.PACKIT_E2E_AUTH_METHOD || "basic";
const basicUser = process.env.PACKIT_E2E_BASiC_USER || "resideUser@resideAdmin.ic.ac.uk";
const basicPassword = process.env.PACKIT_E2E_BASIC_PASSWORD || "password";
const githubToken = process.env.PACKIT_E2E_GITHUB_TOKEN || "";

// Define "setup" as a dependency for any test project which requires prior authentication
setup("authenticate", async({ page }, testInfo) => {
    if (authMethod === "basic") {
        await page.goto("./");
        await page.getByLabel("Email").fill(basicUser);
        await page.getByLabel("Password").fill(basicPassword);
        await page.getByRole("button", {name: /Log in/i}).click();
    } else if (authMethod === "github") {
        if (!githubToken) {
            throw Error("Auth method is github but github token is not set in env.")
        }
        // Use redirect endpoint to login
        await page.goto(`./redirect?token=${githubToken}`);
    } else {
        throw Error(`Unknown auth method from env: ${authMethod}`);
    }
    // Check login has succeeded - admin user should have user access role
    await expect(page.locator("body")).toHaveText(/Manage Access/);
    // write out context to tmp location to be picked up by dependent tests
    const authFile = testInfo.outputPath("auth.json");
    await page.context().storageState({path: authFile});
});
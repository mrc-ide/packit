import process from "node:process";
import { defineConfig, devices } from "@playwright/test";
import path from "path";

const setupProject = {
  name: "setup",
  testMatch: "auth.setup.ts",
  // if running on CI should always be with default credentials, but running locally could require user interaction
  // for auth so allow up to 5 minutes for this
  timeout: process.env.CI ? 30 * 1000 : 5 * 60 * 1000
};

const outputDir = "test-results";
const authStorageStateFile = path.join(__dirname, outputDir, `auth.setup.ts-authenticate-setup/auth.json`);
let baseURL = process.env.PACKIT_E2E_BASE_URL || "http://localhost:3000";
if (!baseURL.endsWith("/")) {
  baseURL = `${baseURL}/`;
}
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  outputDir,
  globalSetup: require.resolve("./e2e/globalSetup.ts"),
  fullyParallel: true,
  timeout: process.env.CI ? 30 * 1000 : 15 * 1000,
  /* Maximum time one test can run for. */
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 10000
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Allow parallel tests */
  workers: undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    headless: true,
    screenshot: "only-on-failure",
    locale: "en-GB"
  },
  /* Configure projects for major browsers */
  projects: process.env.CI
    ? [
      setupProject,
      {
        name: "chromium",
        use: {
          ...devices["Desktop Chrome"],
          // Use prepared auth state.
          storageState: authStorageStateFile
        },
        dependencies: ["setup"]
      },
      {
        name: "webkit",
        use: {
          ...devices["Desktop Safari"],
          // Use prepared auth state.
          storageState: authStorageStateFile
        },
        dependencies: ["setup"]
      }
    ]
    : /* Just test on Chrome when running on local dev */
    [
      setupProject,
      {
        name: "chromium",
        use: {
          ...devices["Desktop Chrome"],
          // Use prepared auth state.
          storageState: authStorageStateFile
        },
        dependencies: ["setup"]
      }
    ]
});

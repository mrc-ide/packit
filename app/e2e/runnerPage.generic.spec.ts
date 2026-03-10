import { Locator } from "@playwright/test";
import { test, expect, TAG_DEMO_PACKETS } from "./tagCheckFixture";
import { getContentLocator } from "./utils";

test.describe("Runner page", () => {
  let content: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    content = await getContentLocator(page);
    await page.getByRole("link", { name: "Runner" }).click();
  });

  test.describe("Packages tab", { tag: TAG_DEMO_PACKETS }, () => {
    // Expect the example package to be listed as installed; this will not be present on
    // demo or prod environments, nor if PACKIT_HOST_R_LIBRARY_PATH was set to anything
    // other than the `./scripts/R/fixtures` path when running dependencies.
    // See api/README.md for more details.
    test("can see list of installed packages", async ({ page }) => {
      await page.getByRole("link", { name: "Packages" }).click();
      await expect(content.getByRole("button", { name: "Installed packages (1)" })).toBeVisible();
      await expect(content.getByText(/minimalRPackage.*0\.0\.1/)).toBeVisible();
    });
  });
});

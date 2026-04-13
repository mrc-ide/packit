import { test, expect, TAG_DEMO_R_LIBRARY } from "./tagCheckFixture";
import { getContentLocator } from "./utils";

test.describe("Runner page", () => {
  test.describe("Packages tab", { tag: TAG_DEMO_R_LIBRARY }, () => {
    // Expect the example R package to be listed as installed; this package will not be present on
    // demo or prod environments, nor if PACKIT_HOST_R_LIBRARY_PATH was set to anything other than
    // the `./scripts/runnerDemoLib` path when running dependencies.
    // See api/README.md for more details.
    test("can see list of installed packages", async ({ page }) => {
      await page.goto("./");
      const content = await getContentLocator(page);
      await page.getByRole("link", { name: "Runner" }).click();
      await page.getByRole("link", { name: "Package versions" }).click();
      await expect(content.getByText(/minimalRPackage.*0\.0\.1/)).toBeVisible();
    });
  });
});

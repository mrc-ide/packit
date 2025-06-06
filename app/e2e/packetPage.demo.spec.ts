import { Locator } from "@playwright/test";
import { test, expect, TAG_DEMO_PACKETS, TAG_STATE_MUTATE } from "./tagCheckFixture";
import {
  createEmptyTestRole,
  doDownload,
  getContentLocator,
  getInstanceRelativePath,
  getPacketPageAccordionSection,
  readDownloadedFile,
  selectPacketPageTab
} from "./utils";

// Tests which are only run against localhost, where we can assume we have the demo dataset packets
test.describe("Demo packet page", { tag: TAG_DEMO_PACKETS }, () => {
  const parametersPacketId = "20240829-185440-781be0f3";
  const dependsPacketId = "20250120-073637-b8c1e707";
  const artefactTypesPacketId = "20240729-155513-1432bfa7";
  const customMetadataPacketId = "20241122-111130-544ddd35";
  const downloadTypesPacketId = "20250122-142620-c741b061";

  test("can see packet group name and packet id", async ({ page }) => {
    await page.goto(`./parameters/${parametersPacketId}`);
    const content = await getContentLocator(page);
    await expect(await content.getByRole("heading", { name: "parameters", level: 2 })).toBeVisible();
    await expect(await content.getByText(parametersPacketId)).toBeVisible();
  });

  test("can see packet group display name and description", async ({ page }) => {
    await page.goto(`./custom_metadata/${customMetadataPacketId}`);
    const content = await getContentLocator(page);
    await expect(await content.getByRole("heading", { name: "Packet with description", level: 2 })).toBeVisible();
    await expect(await content.getByText(customMetadataPacketId)).toBeVisible();
    await expect(await content.locator("span").filter({ hasText: "custom_metadata" })).toBeVisible();
    await expect(await content.getByText("A longer description")).toBeVisible();
  });

  test.describe("Summary", () => {
    test("can see parameters", async ({ page }) => {
      await page.goto(`./parameters/${parametersPacketId}`);
      const parametersDiv = await getPacketPageAccordionSection(page, "Parameters");
      await expect(parametersDiv.getByText("a: 1")).toBeVisible();
      await expect(parametersDiv.getByText("b: hello")).toBeVisible();
      await expect(parametersDiv.getByText("c: false")).toBeVisible();
    });

    test("can see dependencies", async ({ page, baseURL }) => {
      await page.goto(`/depends/${dependsPacketId}`);
      const dependsDiv = await getPacketPageAccordionSection(page, "Dependencies");
      const depItems = await dependsDiv.getByRole("listitem");
      await expect(depItems).toHaveCount(2);
      const dep1Name = "explicit";
      const dep1Id = "20240729-154639-25b955eb";
      const dep1ListItem = await depItems.first();
      const dep1Href = getInstanceRelativePath(baseURL, `${dep1Name}/${dep1Id}`);
      await expect(dep1ListItem).toHaveText(`${dep1Name}${dep1Id}`);
      await expect(dep1ListItem.getByRole("link")).toHaveAttribute("href", dep1Href);
      const dep2Name = "custom_metadata";
      const dep2Id = "20241122-111130-544ddd35";
      const dep2ListItem = await depItems.last();
      const dep2Href = getInstanceRelativePath(baseURL, `${dep2Name}/${dep2Id}`);
      await expect(dep2ListItem).toHaveText(`${dep2Name}${dep2Id}`);
      await expect(dep2ListItem.getByRole("link")).toHaveAttribute("href", dep2Href);
      await dep1ListItem.click();
      const dep1DependsDiv = await getPacketPageAccordionSection(page, "Dependencies");
      const noneDiv = await dep1DependsDiv.locator(".italic");
      if ((await noneDiv.count()) > 0) {
        await expect(noneDiv).toHaveText("None");
      }
    });

    test("can see reports", async ({ page }) => {
      await page.goto(`/artefact-types/${artefactTypesPacketId}`);
      const reportsDiv = await getPacketPageAccordionSection(page, "Reports");
      const reportFrame = await reportsDiv.locator("iframe");
      await expect(reportFrame).toBeVisible();
      await expect(await reportFrame.contentFrame().getByRole("heading")).toHaveText("TEST");
    });
  });

  test.describe("Metadata", () => {
    let content: Locator;

    test.beforeEach(async ({ page }) => {
      await page.goto(`./parameters/${parametersPacketId}`);
      content = await getContentLocator(page);
      await selectPacketPageTab(content, "Metadata");
    });

    test("can see timings", async ({ page }) => {
      const timingsDiv = await getPacketPageAccordionSection(page, "Timings");
      const timingItems = await timingsDiv.getByRole("listitem");
      await expect(await timingItems).toHaveCount(2);
      await expect(await timingItems.first()).toHaveText("StartedThu, 29 Aug 2024 18:54:40 GMT");
      await expect(await timingItems.last()).toHaveText("Elapsed192 milliseconds");
    });

    test("can see git", async ({ page }) => {
      const gitDiv = await getPacketPageAccordionSection(page, "Git");
      // get top level list items
      const listItems = await gitDiv.locator("ul.space-y-1 > li").all();
      await expect(await listItems.length).toBe(3);
      await expect(listItems[0]).toHaveText("Branch" + "mrc-5661-fe-run-params");
      await expect(listItems[1]).toHaveText("Commit" + "4c2b5d37deada04981a906f9705f0414b8ea0dfc");
      await expect(await listItems[2].locator("span")).toHaveText("Remotes");
      const remoteItems = await listItems[2].getByRole("listitem");
      await expect(remoteItems).toHaveCount(1);
      await expect(remoteItems.first()).toHaveText("https://github.com/mrc-ide/packit.git");
    });

    test("can see platform", async ({ page }) => {
      const platformDiv = await getPacketPageAccordionSection(page, "Platform", true);
      // get top level list items
      const listItems = await platformDiv.locator("ul.space-y-1 > li").all();
      await expect(listItems.length).toBe(3);
      await expect(listItems[0]).toHaveText("OS" + "Ubuntu 22.04.4 LTS");
      await expect(listItems[1]).toHaveText("System" + "x86_64, linux-gnu");
      await expect(listItems[2]).toHaveText("Language" + "R version 4.4.1 (2024-06-14)");
    });

    test("can see packages", async ({ page }) => {
      const packagesDiv = await getPacketPageAccordionSection(page, "Packages", true);
      const listItems = await packagesDiv.locator("ul.space-y-1 > li").all();
      await expect(listItems.length).toBe(21);
      await expect(listItems[0]).toHaveText("askpass" + "1.2.0");
    });
  });

  test.describe("Downloads", () => {
    let content: Locator;

    test.beforeEach(async ({ page }) => {
      await page.goto(`./download-types/${downloadTypesPacketId}`);
      content = await getContentLocator(page);
      await selectPacketPageTab(content, "Downloads");
    });

    // Webkit downloads don't work in playwright, but they have been manually tested in Safari 17.5
    // on a Mac on Sonoma 14.5.
    test.skip(({ browserName }) => browserName === "webkit", "Skipping Downloads tests for webkit");

    test("can download an individual file", async ({ page }) => {
      await content.getByRole("button", { name: "Other files" }).click();

      const button = content
        .getByRole("listitem")
        .filter({ hasText: /^data\.csv51 bytesDownload$/ })
        .getByRole("button");
      const download = await doDownload(page, button);
      expect(download.suggestedFilename()).toBe("data.csv");

      const fileContents = await readDownloadedFile(download);
      expect(fileContents).toBe("x,y\n1,2\n2,4\n3,6\n4,8\n5,10\n6,12\n7,14\n8,16\n9,18\n10,20\n");
    });

    test("can download all files in an artefact as a zip", async ({ page }) => {
      const button = content.getByRole("button", { name: "Download (25.61 KB)" });
      const download = await doDownload(page, button);
      expect(download.suggestedFilename()).toBe(`An artefact containi_${downloadTypesPacketId}.zip`);
    });

    test("can download all artefacts as a zip", async ({ page }) => {
      const button = content.getByRole("button", { name: "Download all artefacts (25.65 KB)" });
      const download = await doDownload(page, button);
      expect(download.suggestedFilename()).toBe(`download-types_artefacts_${downloadTypesPacketId}.zip`);
    });

    test("can download all files as a zip", async ({ page }) => {
      const button = content.getByRole("button", { name: "Download all files (33.74 KB)" });
      const download = await doDownload(page, button);
      expect(download.suggestedFilename()).toBe(`download-types_${downloadTypesPacketId}.zip`);
    });
  });

  test.describe("read-access", { tag: TAG_STATE_MUTATE }, () => {
    test("can update read permissions on packet", async ({ page }) => {
      await page.goto("./");
      const testRoleName = await createEmptyTestRole(page);
      await page.goto(`./parameters/${parametersPacketId}`);
      await page.getByRole("link", { name: "Read access" }).click();

      // check existing roles
      await expect(page.getByRole("cell", { name: "ADMIN", exact: true })).toBeVisible();
      await expect(page.getByText("resideUser@resideAdmin.ic.ac.")).toBeVisible();

      // add test role
      await page.getByRole("button", { name: "Update read access" }).click();
      await page
        .getByLabel("Update read access on")
        .locator("div")
        .filter({ hasText: "Select roles or specific" })
        .getByPlaceholder("Select roles or users...")
        .click();
      await page.getByRole("option", { name: `${testRoleName} Role` }).click();
      await page.getByText("Select roles or specific").click();
      await page.getByRole("button", { name: "Save" }).click();

      await expect(page.getByRole("cell", { name: testRoleName })).toBeVisible();

      // remove test role
      await page.getByRole("button", { name: "Update read access" }).click();
      await page
        .locator("div")
        .filter({ hasText: /^Remove read access$/ })
        .getByPlaceholder("Select roles or users...")
        .click();
      await page.getByRole("option", { name: `${testRoleName} Role` }).click();
      await page.getByText("Select roles or specific").click();
      await page.getByRole("button", { name: "Save" }).click();

      await expect(page.getByRole("cell", { name: testRoleName })).not.toBeVisible();
    });
  });
});

import { Locator } from "@playwright/test";
import { test, expect } from "./tagCheckFixture";
import {
  getContentLocator,
  getPacketGroupIndexLocator,
  getPacketPageAccordionSection,
  navigateToFirstPacketGroupLatestPacket,
  selectPacketPageTab
} from "./utils";

// Generic packet page tests which will be run against all servers
test.describe("Packet page", () => {
  let content: Locator;
  let packetGroupName: string, latestPacketId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    content = await getContentLocator(page);
    const packetGroupContainer = await getPacketGroupIndexLocator(page);
    const { packetGroup, packetId } = await navigateToFirstPacketGroupLatestPacket(packetGroupContainer);
    packetGroupName = packetGroup;
    latestPacketId = packetId;
  });

  test("can see packet group name and packet id", async () => {
    await expect(content.getByRole("heading", { name: packetGroupName, level: 2 })).toBeVisible();
    await expect(content.getByText(latestPacketId)).toBeVisible();
  });

  test.describe("Summary", () => {
    test("can see Parameters section", async ({ page }) => {
      const parametersDiv = await getPacketPageAccordionSection(page, "Parameters");
      // Section should contain either "None" or at least one parameter pill
      const noneDiv = await parametersDiv.locator(".italic");
      if ((await noneDiv.count()) > 0) {
        await expect(noneDiv).toHaveText("None");
      } else {
        expect(await parametersDiv.locator("div.rounded-md").count()).toBeGreaterThan(0);
      }
    });

    test("can see Dependencies section", async ({ page }) => {
      const dependenciesDiv = await getPacketPageAccordionSection(page, "Dependencies");
      // Section should contain either no dependencies text, or at least one list item with link
      const noneDiv = dependenciesDiv.locator(".italic");
      if ((await noneDiv.count()) > 0) {
        await expect(noneDiv).toHaveText("None");
      } else {
        const depItems = dependenciesDiv.getByRole("listitem");
        expect(await depItems.count()).toBeGreaterThan(0);
        for (const li of await depItems.all()) {
          const link = li.getByRole("link");
          await expect(link).toBeEnabled();
          const packetId = await link.innerHTML();
          expect((await link.getAttribute("href")).split("/").at(-1)).toBe(packetId);
        }
      }
    });

    test("can see Reports section", async ({ page }) => {
      const reportsDiv = await getPacketPageAccordionSection(page, "Reports");
      // Reports should contain either "None" or at least one iframe
      const noneDiv = reportsDiv.locator(".italic");
      if ((await noneDiv.count()) > 0) {
        await expect(noneDiv).toHaveText("None");
      } else {
        const reportFrames = reportsDiv.locator("iframe");
        await expect(reportFrames).toHaveCount(1);
      }
    });
  });

  test.describe("Metadata", () => {
    test("can see Timings section", async ({ page }) => {
      await selectPacketPageTab(content, "Metadata");
      const timingsDiv = await getPacketPageAccordionSection(page, "Timings");
      const timingItems = timingsDiv.getByRole("listitem");
      await expect(timingItems).toHaveCount(2);
      await expect(timingItems.first()).toHaveText(/Started/);
      await expect(timingItems.last()).toHaveText(/Elapsed\d+/);
    });

    test("can see Git details if Git section exists", async ({ page }) => {
      await selectPacketPageTab(content, "Metadata");
      const gitDiv = await getPacketPageAccordionSection(page, "Git", false, true);
      if (gitDiv) {
        // get top level list items
        const listItems = await gitDiv.locator("ul.space-y-1 > li").all();
        expect(listItems.length).toBe(3);
        await expect(listItems[0]).toHaveText(/^Branch/);
        await expect(listItems[1]).toHaveText(/^Commit[\da-f]{40}$/);
        await expect(listItems[2].locator("span")).toHaveText("Remotes");
        const remoteItems = listItems[2].getByRole("listitem");
        expect(await remoteItems.count()).toBeGreaterThan(0);
      }
    });
  });

  // NB This section may not exist for non-orderly packets, but we don't support those yet
  test("can see Platform section", async ({ page }) => {
    await selectPacketPageTab(content, "Metadata");
    const platformDiv = await getPacketPageAccordionSection(page, "Platform", true);
    // get top level list items
    const listItems = await platformDiv.locator("ul.space-y-1 > li").all();
    expect(listItems.length).toBe(3);
    await expect(listItems[0]).toHaveText(/^OS/);
    await expect(listItems[1]).toHaveText(/^System/);
    await expect(listItems[2]).toHaveText(/^Language/);
  });

  // NB This section may not exist for non-orderly packets, but we don't support those yet
  test("can see Packages section", async ({ page }) => {
    await selectPacketPageTab(content, "Metadata");
    const packagesDiv = await getPacketPageAccordionSection(page, "Packages", true);
    // Might be empty but expect the list to exist!
    await expect(packagesDiv.locator("ul.space-y-1")).toBeVisible();
  });
});

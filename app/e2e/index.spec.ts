import { test, expect } from "./tagCheckFixture";
import { Locator } from "@playwright/test";
import {
  getBreadcrumbLocator,
  getContentLocator,
  getReadableIdString,
  navigateToFirstPacketGroup,
  navigateToFirstPacketGroupLatestPacket,
  packetGroupNameFromListItem
} from "./utils";

test.describe("Index page", () => {
  let content: Locator;
  let packetGroups: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    content = await getContentLocator(page);
    packetGroups = await content.getByRole("listitem");
    expect(await packetGroups.count()).toBeGreaterThan(0);
    // wait for list items to not be skeletal
    await expect(await packetGroups.first().getByRole("heading")).toBeVisible();
  });

  test("can view packet group list", async () => {
    (await packetGroups.all()).forEach((packetGroup) => {
      expect(packetGroup.getByRole("heading")).toBeEnabled(); // packet group name
      expect(packetGroup.getByRole("link", { name: "Latest" })).toBeEnabled();
      expect(packetGroup.getByText(/^\d+ packets?$/)).toBeVisible(); // packet count
      expect(packetGroup.getByText(/^Updated \d+ (second|minute|hour|day)s? ago$/)).toBeVisible(); // updated label
    });
  });

  test("can filter packet groups", async ({ page }) => {
    const firstPacketGroup = await packetGroups.first();
    const firstPacketGroupName = await packetGroupNameFromListItem(firstPacketGroup);
    const filterInput = await page.getByPlaceholder("Filter packet groups...");
    await filterInput.fill(firstPacketGroupName);
    // wait for reset-filter button to become visible
    await expect(await content.getByLabel("reset filter")).toBeVisible();
    const filteredGroups = await content.getByRole("listitem");
    // expect to have at least one packet group remaining, and expect all to have filter term  as a substring
    expect(await filteredGroups.count()).toBeGreaterThan(0);
    for (const packetGroup of await filteredGroups.all()) {
      expect(await packetGroupNameFromListItem(packetGroup)).toContain(firstPacketGroupName);
    }
  });

  test("can navigate from packet group name link to packet group page", async ({ page }) => {
    const firstPacketGroupName = await navigateToFirstPacketGroup(content);
    const displayName = getReadableIdString(firstPacketGroupName);
    // wait for packet group name to be visible in breadcrumb
    await expect(await getBreadcrumbLocator(page)).toHaveText(`home${displayName}`);
  });

  test("can navigate from latest packet link to packet page", async ({ page }) => {
    const { packetGroupName, packetId } = await navigateToFirstPacketGroupLatestPacket(content);
    // wait for packet group name and latest packet id to be visible in breadcrumb
    const displayPacketId = getReadableIdString(packetId);
    const displayPacketGroupName = getReadableIdString(packetGroupName);
    await expect(await getBreadcrumbLocator(page)).toHaveText(`home${displayPacketGroupName}${displayPacketId}`);
  });
});

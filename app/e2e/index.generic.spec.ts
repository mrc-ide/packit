import { test, expect, TAG_STATE_MUTATE } from "./tagCheckFixture";
import { Locator } from "@playwright/test";
import {
  createEmptyTestRole,
  getBreadcrumbLocator,
  getPacketGroupIndexLocator,
  getPinsLocator,
  getReadableIdString,
  navigateToFirstPacketGroup,
  navigateToFirstPacketGroupLatestPacket,
  navigateToFirstPinnedPacket,
  packetDisplayNameFromPinListItem,
  packetGroupNameFromListItem
} from "./utils";

test.describe("Index page", () => {
  let packetGroupContainer: Locator;
  let packetGroups: Locator;
  let pinsContainer: Locator;
  let pins: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto("./");

    packetGroupContainer = await getPacketGroupIndexLocator(page);
    packetGroups = await packetGroupContainer.getByRole("listitem");
    expect(await packetGroups.count()).toBeGreaterThan(0);

    pinsContainer = await getPinsLocator(page);
    pins = await pinsContainer.getByRole("listitem");
    expect(await pins.count()).toBeGreaterThan(0);

    // wait for list items to not be skeletal
    await expect(await packetGroups.first().getByRole("heading")).toBeVisible();
    await expect(await pins.first().getByRole("heading")).toBeVisible();
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
    const filterInput = await page.getByPlaceholder("Filter packet groups");
    await filterInput.fill(firstPacketGroupName);
    // wait for reset-filter button to become visible
    await expect(await packetGroupContainer.getByLabel("reset filter")).toBeVisible();
    const filteredGroups = await packetGroupContainer.getByRole("listitem");
    // expect to have at least one packet group remaining, and expect all to have filter term as a substring
    expect(await filteredGroups.count()).toBeGreaterThan(0);
    for (const packetGroup of await filteredGroups.all()) {
      expect(await packetGroupNameFromListItem(packetGroup)).toContain(firstPacketGroupName);
    }
  });

  test("can navigate from packet group name link to packet group page", async ({ page }) => {
    const firstPacketGroupName = await navigateToFirstPacketGroup(packetGroupContainer);
    const displayName = getReadableIdString(firstPacketGroupName);
    // wait for packet group name to be visible in breadcrumb
    await expect(await getBreadcrumbLocator(page)).toHaveText(`home${displayName}`);
  });

  test("can navigate from latest packet link to packet page", async ({ page }) => {
    const { packetGroupName, packetId } = await navigateToFirstPacketGroupLatestPacket(packetGroupContainer);
    // wait for packet group name and latest packet id to be visible in breadcrumb
    const displayPacketId = getReadableIdString(packetId);
    const displayPacketGroupName = getReadableIdString(packetGroupName);
    await expect(await getBreadcrumbLocator(page)).toHaveText(`home${displayPacketGroupName}${displayPacketId}`);
  });

  test("can view list of pins", async () => {
    (await pins.all()).forEach(async (pin) => {
      const packetDisplayName = await packetDisplayNameFromPinListItem(pin);
      expect(pin.getByRole("link", { name: packetDisplayName })).toBeEnabled();

      const button = pin.getByRole("button");
      const buttonName = await button.textContent();

      if (buttonName && /Download artefacts/.test(buttonName)) {
        expect(await button.isEnabled()).toBe(true);
      } else if (buttonName && /No artefacts/.test(buttonName)) {
        expect(await button.isEnabled()).toBe(false);
      } else {
        throw new Error(`Unexpected button name: ${buttonName}`);
      }

      expect(pin.getByText(/^Ran \d+ (second|minute|hour|day)s? ago$/)).toBeVisible();
    });
  });

  test("can navigate from pinned packet name link to packet page", async ({ page }) => {
    const { packetName, packetId } = await navigateToFirstPinnedPacket(pinsContainer);
    // wait for packet group name and latest packet id to be visible in breadcrumb
    const displayPacketId = getReadableIdString(packetId);
    const displayPacketGroupName = getReadableIdString(packetName); // packet group names are identical to packet names
    await expect(await getBreadcrumbLocator(page)).toHaveText(`home${displayPacketGroupName}${displayPacketId}`);
  });

  test("can add update read permission on packet group", { tag: TAG_STATE_MUTATE }, async ({ page }) => {
    // create test role with no permissions if not exists
    const testRoleName = await createEmptyTestRole(page);

    const firstPacketGroup = packetGroups.first();
    const firstPacketGroupName = await packetGroupNameFromListItem(firstPacketGroup);
    // add permission
    await page.getByRole("button", { name: `manage-access-${firstPacketGroupName}` }).click();
    await expect(page.getByRole("heading", { name: "Update read access on" })).toBeVisible();
    await page
      .getByLabel("Update read access on")
      .locator("div")
      .filter({ hasText: "Select roles or specific" })
      .getByPlaceholder("Select roles or users...")
      .click();
    await page.getByRole("option", { name: `${testRoleName} Role` }).click();
    await page.getByRole("heading", { name: "Update read access on" }).click();
    await page.getByRole("button", { name: "Save" }).click();
    // remove permission
    await page.getByRole("button", { name: `manage-access-${firstPacketGroupName}` }).click();
    await page
      .locator("div")
      .filter({ hasText: /^Remove read access$/ })
      .getByPlaceholder("Select roles or users...")
      .click();
    await page.getByRole("option", { name: `${testRoleName} Role` }).click();
    await page.getByRole("heading", { name: "Update read access on" }).click();
    await page.getByRole("button", { name: "Save" }).click();
    // check to ensure removed and is visible on grant list
    await page.getByRole("button", { name: `manage-access-${firstPacketGroupName}` }).click();
    await page
      .getByLabel("Update read access on")
      .locator("div")
      .filter({ hasText: "Select roles or specific" })
      .getByPlaceholder("Select roles or users...")
      .click();

    await expect(page.getByText(`${testRoleName}Role`)).toBeVisible();
  });
});

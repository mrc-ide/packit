import { Locator } from "@playwright/test";
import { expect, TAG_DEMO_PACKETS, test } from "./tagCheckFixture";
import { getPacketGroupIndexLocator, packetDisplayNameFromPinListItem } from "./utils";

// Tests which are only run against localhost, where we can assume we have the demo dataset packets
test.describe("Demo index page", { tag: TAG_DEMO_PACKETS }, () => {
  let packetGroupContainer: Locator;
  let packetGroups: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto("./");

    packetGroupContainer = await getPacketGroupIndexLocator(page);
    packetGroups = packetGroupContainer.getByRole("listitem");
    expect(await packetGroups.count()).toBeGreaterThan(0);

    // wait for list items to not be skeletal
    await expect(packetGroups.first().getByRole("heading")).toBeVisible();
  });

  test.describe("pinned packets", async () => {
    const numberOfDemoPins = 3;
    let pinsContainer: Locator;
    let pins: Locator;

    test.beforeEach(async ({ page }) => {
      pinsContainer = page.getByTestId("pins");
      pins = pinsContainer.getByRole("listitem");
      expect(await pins.count()).toEqual(numberOfDemoPins); // we have 3 demo pins

      // wait for list items to not be skeletal
      for (let i = 0; i < numberOfDemoPins; i++) {
        await expect(pins.nth(i).getByRole("heading")).toBeVisible();
      }
    });

    test("can view list of pins", async () => {
      expect(await packetDisplayNameFromPinListItem(pins.nth(0))).toEqual("Packet with description");
      expect(await pins.nth(0).getByRole("button").textContent()).toEqual("Download artefacts (7.17 KB)");
      expect(pins.nth(0).getByText(/^Ran \d+ days ago$/)).toBeVisible();

      expect(await packetDisplayNameFromPinListItem(pins.nth(1))).toEqual("test1");
      expect(await pins.nth(1).getByRole("button").textContent()).toEqual("No artefacts");
      expect(pins.nth(1).getByText(/^Ran \d+ days ago$/)).toBeVisible();

      expect(await packetDisplayNameFromPinListItem(pins.nth(2))).toEqual("artefact-types");
      expect(await pins.nth(2).getByRole("button").textContent()).toEqual("Download artefacts (40 bytes");
      expect(pins.nth(2).getByText(/^Ran \d+ days ago$/)).toBeVisible();
    });
  });
});

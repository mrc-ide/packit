import {test, expect, Locator} from "@playwright/test";
import {getContentLocator} from "./utils";

test.describe(() => {
  let content: Locator;

  test.beforeEach(async ({page}) => {
    await page.goto("./");
    content = await getContentLocator(page);
  });

  test("can view packet group list", async ({ page }) => {
    const packetGroups = await content.getByRole("listitem");
    expect(await packetGroups.count()).toBeGreaterThan(0);
    (await packetGroups.all()).forEach((packetGroup) => {
        expect(packetGroup.getByRole("heading")).toBeEnabled(); // packet group name
        expect(packetGroup.getByRole("link", { name: "Latest" })).toBeEnabled();
        expect(packetGroup.getByText(/^\d+ packets?$/)).toBeVisible(); // packet count
        expect(packetGroup.getByText(/^Updated \d+ (second|minute|hour|day)s? ago$/)).toBeVisible(); // updated label

    });
  });

  test("can filter packet groups", async ({ page }) => {
    const packetGroups = await content.getByRole("listitem");
    const packetGroupsCount = await packetGroups.count();

    // get longest packet group name
    const packetGroupsArr = await packetGroups.all();
    let longestName = "";
    for(const packetGroup of packetGroupsArr) {
      const name = await packetGroup.getByRole("heading").innerText();
      if (name.length > longestName.length) {
        longestName = name;
      }
    }

    // enter letters in filter input until number of packet groups is reduced
    const filterTerm = "";
    const filterInput = await page.getByPlaceholder("Filter packet groups...");
    await expect(filterInput).toBeEnabled();


    // visible packet groups should only include the substring which was entered
  });


  // can navigate by titel link to correct packetgroup paget
  // can navigate by latest link to correct packet page
});

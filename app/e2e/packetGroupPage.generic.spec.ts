import { Locator } from "@playwright/test";
import { getContentLocator, getInstanceRelativePath, navigateToFirstPacketGroup } from "./utils";
import { test, expect, TAG_STATE_MUTATE } from "./tagCheckFixture";

test.describe("Packet group page", () => {
  let packetGroupName: string;
  let rows: Locator;
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    const content = await getContentLocator(page);
    packetGroupName = await navigateToFirstPacketGroup(content);
    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    rows = table.getByRole("row");
  });

  test("can see packet rows", async ({ baseURL }) => {
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
    const lastRow = rows.last(); // any packet row would do, and first row has headers
    const firstCell = lastRow.getByRole("cell").first();
    const link = firstCell.getByRole("link");
    await expect(link).toHaveText(/^\d{8}-\d{6}-[\da-f]{8}$/);
    const packetId = await link.innerText();
    const expectedHref = getInstanceRelativePath(baseURL, `${packetGroupName}/${packetId}`);
    expect(await link.getAttribute("href")).toBe(expectedHref);
    await expect(firstCell.locator("div.text-muted-foreground")).toBeVisible();
    const secondCell = (await lastRow.getByRole("cell").all())[1];
    // Expect secondCell to either have "None" text or at least one parameter
    const noneDiv = secondCell.locator("div.italic");
    if ((await noneDiv.count()) > 0) {
      await expect(noneDiv).toHaveText("None");
    } else {
      const parameterPills = await secondCell.locator(".rounded-md");
      expect(await parameterPills.count()).toBeGreaterThan(0);
    }
  });

  test("can search packet rows by id", async () => {
    const lastRow = rows.last();
    const link = lastRow.getByRole("cell").getByRole("link");
    const packetId = await link.innerText();
    // Enter packet id in input
    const packetInput = rows.first().getByRole("cell").first().getByPlaceholder("Search...");
    await packetInput.fill(packetId);
    // should only have two rows left (of which the first is headers) and last should have the id of the entered term
    await expect(rows).toHaveCount(2);
    const secondRow = (await rows.all())[1];
    await expect(secondRow.getByRole("cell").getByRole("link")).toHaveText(packetId);
  });

  test("state mutate placeholder test", { tag: TAG_STATE_MUTATE }, async () => {
    // This does not actually do any server state mutating but is just a placeholder test to demonstrate
    // tagCheckFixture behaviour. Can be removed when have some real state mutating tests
    rows.last();
  });
});

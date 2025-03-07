import { Locator } from "@playwright/test";
import { test, expect, TAG_DEMO_PACKETS } from "./tagCheckFixture";
import { getInstanceRelativePath } from "./utils";

// Tests which are only run against localhost, where we can assume we have the demo dataset packets
test.describe("Demo packet group page", { tag: TAG_DEMO_PACKETS }, () => {
  const packetId = "20240729-154652-95a6c08c";
  let rows: Locator;
  test.beforeEach(async ({ page }) => {
    await page.goto("./parameters");
    const table = await page.getByRole("table");
    await expect(table).toBeVisible();
    rows = await table.getByRole("row");
  });

  // we can't assume new packets won't have been created, but should at least have those from the demo set
  test("can see packet rows", async ({ baseURL, page }) => {
    await expect(await rows.count()).toBeGreaterThanOrEqual(3);
    const oldestRow = await rows.last();
    const firstCell = await oldestRow.getByRole("cell").first();
    const link = await firstCell.getByRole("link");
    await expect(link).toHaveText(packetId);
    const expectedHref = getInstanceRelativePath(baseURL, `parameters/${packetId}`);
    await expect(await link.getAttribute("href")).toBe(expectedHref);
    // We expect servers we're testing on to have either GB or US locale.
    // Using node current locale doesn't always match browser.
    const expectedDate = new Date(Date.UTC(2024, 6, 29, 15, 46, 52));
    const usLocale = expectedDate.toLocaleString("en-US");
    const gbLocale = expectedDate.toLocaleString("en-GB");
    const dateLocator = await firstCell.locator("div.text-muted-foreground");
    await expect(dateLocator).toBeVisible();
    const dateText = await dateLocator.innerHTML();
    expect(dateText === usLocale || dateText === gbLocale).toBe(true);
    const secondCell = (await oldestRow.getByRole("cell").all())[1];
    const parameterPills = await secondCell.locator(".rounded-md").all();
    await expect(parameterPills.length).toBe(3);
    // Parameters are currently in a random order!
    const parameterTexts = [];
    for (const pill of parameterPills) {
      parameterTexts.push(await pill.textContent());
    }
    parameterTexts.sort();
    await expect(parameterTexts[0]).toBe("a:  1");
    await expect(parameterTexts[1]).toBe("b:  2");
    await expect(parameterTexts[2]).toBe("c:  3");
  });

  test("can search packet rows by id", async () => {
    // Enter packet id in input
    const packetInput = await rows.first().getByRole("cell").first().getByPlaceholder("Search...");
    await packetInput.fill(packetId);
    // should only have two rows left (of which the first is headers) and last should have the id of the entered term
    await expect(rows).toHaveCount(2);
    const secondRow = (await rows.all())[1];
    await expect(await secondRow.getByRole("cell").getByRole("link")).toHaveText(packetId);
  });

  test("can search packet rows by parameter", async () => {
    const secondCell = (await rows.first().getByRole("cell").all())[1];
    const parametersInput = await secondCell.getByPlaceholder("Search...");
    await parametersInput.fill("hello");
    await expect(rows).toHaveCount(2);
    const secondRow = (await rows.all())[1];
    await expect(await secondRow.getByRole("cell").getByRole("link")).toHaveText("20240829-185440-781be0f3");
  });

  test("can add parameter column", async ({ page }) => {
    const lastRowCells = await rows.last().getByRole("cell");
    await expect(lastRowCells).toHaveCount(2);
    const parameterColumnsButton = page.getByRole("button", { name: "Parameter Columns" });
    await expect(parameterColumnsButton).toBeEnabled();
    await parameterColumnsButton.click();
    const parameterCheckBox = page.getByRole("menuitemcheckbox", { name: "a" });
    await expect(parameterCheckBox).toBeEnabled();
    await expect(parameterCheckBox).not.toBeChecked();
    await parameterCheckBox.check();
    await expect(lastRowCells).toHaveCount(3); // should have a new column for parameter "a"
    await expect(rows.first().getByRole("cell").last()).toHaveText("a"); //header
    await expect(lastRowCells.last()).toHaveText("1");
    const parametersCell = (await lastRowCells.all())[1];
    const parameterPills = await parametersCell.locator(".rounded-md").all();
    await expect(parameterPills.length).toBe(2); // a should have been removed
  });
});

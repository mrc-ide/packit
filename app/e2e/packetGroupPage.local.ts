import {test, expect, Locator} from "@playwright/test";

test.describe("Local packet group page", () => {
    const packetId = "20240729-154652-95a6c08c";
    let table: Locator;
    test.beforeEach(async ({page}) => {
        await page.goto("./parameters");
        table = await page.getByRole("table");
        await expect(table).toBeVisible();
    });

    // we can't assume new packets won't have been created, but should at least have those from the demo set
    test("can see packet rows", async () => {
        const rows = await table.getByRole("row");
        await expect(await rows.count()).toBeGreaterThanOrEqual(3);
        const oldestRow = await rows.last();
        const firstCell = await oldestRow.getByRole("cell").first();
        const link = await firstCell.getByRole("link");
        await expect(link).toHaveText(packetId);
        await expect(await link.getAttribute("href")).toBe(`/parameters/${packetId}`);
        await expect(await firstCell.locator("div.text-muted-foreground")).toHaveText("7/29/2024, 4:46:52 PM");
        const secondCell = (await oldestRow.getByRole("cell").all())[1];
        const parameterPills = await secondCell.locator(".rounded-md").all();
        await expect(parameterPills.length).toBe(3)
        await expect(parameterPills[0]).toHaveText("a: 1");
        await expect(parameterPills[1]).toHaveText("b: 2");
        await expect(parameterPills[2]).toHaveText("c: 3");
    });
});

// packet group - each list item display
// packet group - each list item link
// packet group - parameter search
// packet group - id search
// parameter columns
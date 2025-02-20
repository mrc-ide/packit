import {expect, Locator, test} from "@playwright/test";
import {getContentLocator, navigateToFirstPacketGroup} from "./utils";

test.describe("Packet group page", () => {
    let packetGroupName: string;
    let rows: Locator;
    test.beforeEach(async ({page}) => {
        await page.goto("./");
        const content = await getContentLocator(page);
        packetGroupName = await navigateToFirstPacketGroup(content);
        const table = await page.getByRole("table");
        await expect(table).toBeVisible();
        rows = await table.getByRole("row");
    });

    test("can see packet rows", async () => {
        await expect(await rows.count()).toBeGreaterThanOrEqual(1);
        const lastRow = await rows.last(); // any packet row would do, and first row has headers
        const firstCell = await lastRow.getByRole("cell").first();
        const link = await firstCell.getByRole("link");
        await expect(link).toHaveText(/^\d{8}-\d{6}-[\da-f]{8}$/);
        const packetId = await link.innerText();
        await expect(await link.getAttribute("href")).toBe(`/${packetGroupName}/${packetId}`);
        await expect(await firstCell.locator("div.text-muted-foreground")).toBeVisible();
        const secondCell = (await lastRow.getByRole("cell").all())[1];
        // Expect secondCell to either have "None" text or at least one parameter
        const noneDiv = await secondCell.locator("div.italic");
        if (await noneDiv.count() > 0) {
            await expect(noneDiv).toHaveText("None");
        } else {
            const parameterPills = await secondCell.locator(".rounded-md");
            await expect(await parameterPills.count()).toBeGreaterThan(0);
        }
    });

    test("can search packet rows by id", async () => {
        const lastRow = await rows.last();
        const link = await lastRow.getByRole("cell").getByRole("link");
        const packetId = await link.innerText();
        // Enter packet id in input
        const packetInput = await rows.first().getByRole("cell").first().getByPlaceholder("Search...");
        await packetInput.fill(packetId);
        // should only have two rows left and last should have the id of the entered term
        await expect(rows).toHaveCount(2);
        const secondRow = (await rows.all())[1];
        await expect(await secondRow.getByRole("cell").getByRole("link")).toHaveText(packetId);
    });
});
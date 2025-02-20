import {test, expect, Locator} from "@playwright/test";

test.describe("Local packet group page", () => {
    const packetId = "20240729-154652-95a6c08c";
    let rows: Locator;
    test.beforeEach(async ({page}) => {
        await page.goto("./parameters");
        const table = await page.getByRole("table");
        await expect(table).toBeVisible();
        rows = await table.getByRole("row")
    });

    // we can't assume new packets won't have been created, but should at least have those from the demo set
    test("can see packet rows", async () => {
        await expect(await rows.count()).toBeGreaterThanOrEqual(3);
        const oldestRow = await rows.last();
        const firstCell = await oldestRow.getByRole("cell").first();
        const link = await firstCell.getByRole("link");
        await expect(link).toHaveText(packetId);
        await expect(await link.getAttribute("href")).toBe(`/parameters/${packetId}`);
        await expect(await firstCell.locator("div.text-muted-foreground")).toHaveText("7/29/2024, 4:46:52 PM");
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
        // should only have two rows left and last should have the id of the entered term
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
});


// parameter columns
import { test, expect, Page } from "@playwright/test";
import {getContentLocator, getPacketPageAccordionSection} from "./utils";

// Test which are only run against localhost, where we can assume we have the demo dataset packets
test.describe("Local packet page", () => {
    const parametersPacketId = "20240829-185440-781be0f3";
    const dependsPacketId = "20250120-073637-b8c1e707";
    const artefactTypesPacketId = "20240729-155513-1432bfa7";

    test("can see packet group name and packet id", async ({ page }) => {
        await page.goto(`./parameters/${parametersPacketId}`);
        const content = await getContentLocator(page);
        await expect(await content.getByRole("heading", { name: "parameters", level: 2 })).toBeVisible();
        await expect(await content.getByText(parametersPacketId)).toBeVisible();
    });

    test("can see parameters", async ({ page }) => {
        await page.goto(`./parameters/${parametersPacketId}`);
        const content = await getContentLocator(page);
        const parametersDiv = await getPacketPageAccordionSection(content, "Parameters");
        await expect(parametersDiv).toBeVisible();
        await expect(parametersDiv.getByText("a: 1")).toBeVisible();
        await expect(parametersDiv.getByText("b: hello")).toBeVisible();
        await expect(parametersDiv.getByText("c: false")).toBeVisible();
    });

    test("can see dependencies", async ({ page }) => {
        await page.goto(`/depends/${dependsPacketId}`);
        const content = await getContentLocator(page);
        const dependsDiv = await getPacketPageAccordionSection(content, "Dependencies");
        await expect(dependsDiv).toBeVisible();
        const depItems = await dependsDiv.getByRole("listitem");
        await expect(depItems).toHaveCount(2);
        const dep1Name = "explicit";
        const dep1Id = "20240729-154639-25b955eb";
        await expect(await depItems.first()).toHaveText(`${dep1Name}${dep1Id}`);
        await expect(await depItems.first().getByRole("link")).toHaveAttribute("href", `/${dep1Name}/${dep1Id}`);
        const dep2Name = "custom_metadata";
        const dep2Id = "20241122-111130-544ddd35";
        await expect(await depItems.last()).toHaveText(`${dep2Name}${dep2Id}`);
        await expect(await depItems.last().getByRole("link")).toHaveAttribute("href", `/${dep2Name}/${dep2Id}`);
    });

    test("can see reports", async ({ page }) => {
        await page.goto(`/artefact-types/${artefactTypesPacketId}`);
        const content = await getContentLocator(page);
        const reportsDiv = await getPacketPageAccordionSection(content, "Reports");
        await expect(reportsDiv).toBeVisible();
        const reportFrame = await reportsDiv.locator("iframe");
        await expect(reportFrame).toBeVisible();
        await expect(await reportFrame.contentFrame().getByRole("heading")).toHaveText("TEST");
    });
});
import {test, expect, Locator} from "@playwright/test";
import {
    getContentLocator,
    getPacketPageAccordionSection,
    navigateToFirstPacketGroupLatestPacket,
    selectPacketPageTab
} from "./utils";

// Generic packet page tests which will be run against all servers
test.describe("Packet page", () => {
    let content: Locator;
    let packetGroupName, latestPacketId: string;

    test.beforeEach(async ({ page }) => {
        await page.goto("./");
        content = await getContentLocator(page);
        const {  packetGroup, packetId  } = await navigateToFirstPacketGroupLatestPacket(content);
        packetGroupName = packetGroup;
        latestPacketId = packetId;
    });

    test("can see packet group name and packet id", async ({ page }) => {
        await expect(await content.getByRole("heading", { name: packetGroupName, level: 2 })).toBeVisible();
        await expect(await content.getByText(latestPacketId)).toBeVisible();
    });

    test.describe("Summary", () => {
        test("can see Parameters section", async ({page}) => {
            const content = await getContentLocator(page);
            const parametersDiv = await getPacketPageAccordionSection(content, "Parameters");
            // Section should contain either "None" or at least one parameter pill
            await expect(parametersDiv).toBeVisible();
            const noneDiv = await parametersDiv.locator(".italic");
            if (await noneDiv.count() > 0) {
                await expect(noneDiv).toHaveText("None");
            } else {
                await expect(await parametersDiv.locator("div.rounded-md").count()).toBeGreaterThan(0);
            }
        });

        test("can see Dependencies section", async ({page}) => {
            const content = await getContentLocator(page);
            const dependenciesDiv = await getPacketPageAccordionSection(content, "Dependencies");
            await expect(dependenciesDiv).toBeVisible();
            // Section should contain either no depencies text, or at least one list item with link
            const noneDiv = await dependenciesDiv.locator(".italic");
            if (await noneDiv.count() > 0) {
                await expect(noneDiv).toHaveText("This packet has no dependencies on other packets");
            } else {
                const depItems = await dependenciesDiv.getByRole("listitem");
                await expect(await depItems.count()).toBeGreaterThan(0);
                for (const li of await depItems.all()) {
                    const link = await li.getByRole("link");
                    await expect(link).toBeEnabled();
                    const linkText = await link.innerHTML();
                    expect((await link.getAttribute("href")).split("/").at(-1)).toBe(linkText);
                }
            }
        });

        test("can see Reports section", async ({page}) => {
            const content = await getContentLocator(page);
            const reportsDiv = await getPacketPageAccordionSection(content, "Reports");
            await expect(reportsDiv).toBeVisible();
            // Reports should contain either "None" or at least one iframe
            const noneDiv = await reportsDiv.locator(".italic");
            if (await noneDiv.count() > 0) {
                await expect(noneDiv).toHaveText("None");
            } else {
                const reportFrames = await reportsDiv.locator("iframe");
                await expect(reportFrames.count()).toBeGreaterThan(0);
            }
        });
    });

    test.describe("Metadata", () => {
        test("can see Timings section", async ({ page }) => {
            const content = await getContentLocator(page);
            await selectPacketPageTab(content, "Metadata");
            const timingsDiv = await getPacketPageAccordionSection(content, "Timings");
            const timingItems = await timingsDiv.getByRole("listitem");
            await expect(await timingItems).toHaveCount(2);
            await expect(await timingItems.first()).toHaveText(/Started/);
            await expect(await timingItems.last()).toHaveText(/Elapsed\d+/);
        });
    });

    // metadata
    // Git - branch, commit, remotes
    // Platform (expand)- OS, System, Language
    // Packages (expand) - list

    // downloads: Artefacts, other files
});

// packet group - each list item display
// packet group - each list item link
// packet group - parameter search

// Manage roles - view roles
// manage roles - view users
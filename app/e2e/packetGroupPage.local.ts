import { test, expect } from "@playwright/test";

test.describe("Local packet group page", () => {
    test.beforeEach(async ({page}) => {
        await page.goto("./parameters");
    });

    // we can't assume new packets won't have been created, but should at least have those from the demo set
});

// packet group - each list item display
// packet group - each list item link
// packet group - parameter search
// packet group - id search
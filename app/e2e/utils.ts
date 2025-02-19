import { Page } from "@playwright/test";

export const getContentLocator = async (page: Page) => {
    return page.getByTestId("content");
};
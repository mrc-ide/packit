import {Locator, Page} from "@playwright/test";

export const serverIsLocalhost = () => {};

export const getContentLocator = async (page: Page) => {
    return page.getByTestId("content");
};

export const getBreadcrumbLocator = async (page: Page) => {
    return page.getByTestId("breadcrumb");
};

export const packetGroupNameFromListItem = async (listItem: Locator) => {
    return await listItem.getByRole("heading").innerText();
};

export const getFirstPacketGroupListItem = async (content: Locator) => {
    return content.getByRole("listitem").first();
};

export const navigateToFirstPacketGroup = async (content: Locator) => {
    const firstPacketGroup = await getFirstPacketGroupListItem(content);
    const firstPacketGroupName = await packetGroupNameFromListItem(firstPacketGroup);
    await firstPacketGroup.getByRole("heading").click();
    return firstPacketGroupName;
};

export const navigateToFirstPacketGroupLatestPacket = async (content: Locator) => {
    const firstPacketGroup = await getFirstPacketGroupListItem(content);
    const packetGroupName = await packetGroupNameFromListItem(firstPacketGroup);
    const latestLink = firstPacketGroup.getByRole("link", { name: "Latest" });
    const packetId = (await latestLink.getAttribute("href")).split("/").at(-1) as string;
    await latestLink.click();
    return { packetGroupName, packetId };
};

export const getPacketPageAccordionSection = async (content: Locator, title: string) => {
    return content.locator("div.border-b:has(h3[data-orientation='vertical'])").filter({hasText: title});
};

export const selectPacketPageTab = async (content: Locator, tab: string) => {
    const nav = await content.getByRole("navigation");
    await nav.getByRole("link", { name: tab }).click();
};
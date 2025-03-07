import { Locator, Page, expect } from "@playwright/test";

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

export const getReadableIdString = (id: string) => id.replaceAll("-", " ");

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

export const getPacketPageAccordionSection = async (page: Page, title: string, clickToExpand = false, sectionIsOptional = false) => {
  const content = await getContentLocator(page);
  const section = content.locator("div.border-b:has(h3[data-orientation='vertical'])").filter({ hasText: title });

  const count = await section.count();
  if (count === 0 && sectionIsOptional) {
    return null;
  }

  await expect(await section).toBeVisible();
  if (clickToExpand) {
    await section.locator("h3[data-orientation='vertical']").click();
  }
  return section;
};

export const selectPacketPageTab = async (content: Locator, tab: string) => {
  const nav = await content.getByRole("navigation");
  await nav.getByRole("link", { name: tab }).click();
};

// Get a relative path which includes the packit instance, if any
export const getInstanceRelativePath = (baseURL: string, path: string) => {
  const basePath = new URL(baseURL).pathname;
  return `${basePath}/${path}`.replaceAll("//", "/");
};

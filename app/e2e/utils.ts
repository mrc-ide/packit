import { Locator, Page, expect } from "@playwright/test";

export const getContentLocator = async (page: Page) => {
  return page.getByTestId("content");
};

export const getPacketGroupIndexLocator = async (page: Page) => {
  return page.getByTestId("packet-group-index");
};

export const getPinsLocator = async (page: Page) => {
  return page.getByTestId("pins");
};

export const getBreadcrumbLocator = async (page: Page) => {
  return page.getByTestId("breadcrumb");
};

export const packetDisplayNameFromPinListItem = async (listItem: Locator) => {
  const heading = listItem.getByRole("heading");
  const headingText = await heading.innerText();
  return headingText;
};

const getFirstPin = async (container: Locator) => {
  const result = container.getByRole("listitem").first();
  await expect(result.getByRole("heading")).toBeVisible(); // wait for text to load
  return result;
};

export const navigateToFirstPinnedPacket = async (container: Locator) => {
  const firstPin = await getFirstPin(container);
  const packetDisplayName = await packetDisplayNameFromPinListItem(firstPin);
  const link = firstPin.getByRole("link", { name: packetDisplayName });
  const href = await link.getAttribute("href");
  const packetId = href.split("/").at(-1) as string;
  const packetName = href.split("/").at(-2) as string;
  await link.click();
  return { packetName, packetId };
};

export const packetGroupNameFromListItem = async (listItem: Locator) => {
  // if there is a div with muted text in the list item, that will be the actual packet group name (heading will
  // be display name - otherwise, use the heading
  const mutedNameLocator = await listItem.locator("div.text-muted-foreground.text-sm");
  const count = await mutedNameLocator.count();
  if (count === 0) {
    return await listItem.getByRole("heading").innerText();
  } else {
    return await mutedNameLocator.innerText();
  }
};

const getFirstPacketGroupListItem = async (container: Locator) => {
  const result = container.getByRole("listitem").first();
  await expect(result.getByRole("heading")).toBeVisible(); // wait for text to load
  return result;
};

export const getReadableIdString = (id: string) => id.replaceAll("-", " ");

export const navigateToFirstPacketGroup = async (container: Locator) => {
  const firstPacketGroup = await getFirstPacketGroupListItem(container);
  const firstPacketGroupName = await packetGroupNameFromListItem(firstPacketGroup);
  await firstPacketGroup.getByRole("heading").click();
  return firstPacketGroupName;
};

export const navigateToFirstPacketGroupLatestPacket = async (container: Locator) => {
  const firstPacketGroup = await getFirstPacketGroupListItem(container);
  const packetGroupName = await packetGroupNameFromListItem(firstPacketGroup);
  const latestLink = firstPacketGroup.getByRole("link", { name: "Latest" });
  const packetId = (await latestLink.getAttribute("href")).split("/").at(-1) as string;
  await latestLink.click();
  return { packetGroupName, packetId };
};

export const getPacketPageAccordionSection = async (
  page: Page,
  title: string,
  clickToExpand = false,
  sectionIsOptional = false
) => {
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

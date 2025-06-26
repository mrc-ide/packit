import { Download, Locator, Page, expect } from "@playwright/test";
import { randomUUID } from "crypto";

export const getContentLocator = async (page: Page) => {
  return page.getByTestId("content");
};

export const getPacketGroupIndexLocator = async (page: Page) => {
  return page.getByTestId("packet-group-index");
};

export const getBreadcrumbLocator = async (page: Page) => {
  return page.getByTestId("breadcrumb");
};

export const packetDisplayNameFromPinListItem = async (listItem: Locator) => {
  const heading = listItem.getByRole("heading");
  const headingText = await heading.innerText();
  return headingText;
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

  await expect(section).toBeVisible();
  if (clickToExpand) {
    await section.locator("h3[data-orientation='vertical']").click();
  }
  return section;
};

export const selectPacketPageTab = async (content: Locator, tab: string) => {
  const nav = content.getByRole("navigation");
  await nav.getByRole("link", { name: tab }).click();
};

// Get a relative path which includes the packit instance, if any
export const getInstanceRelativePath = (baseURL: string, path: string) => {
  const basePath = new URL(baseURL).pathname;
  return `${basePath}/${path}`.replaceAll("//", "/");
};

export const createEmptyTestRole = async (page: Page) => {
  const testRoleName = `e2eTest${randomUUID().replaceAll("-", "")}`;
  await page.getByRole("link", { name: "Admin" }).click();
  await page.getByRole("button", { name: "Add Role" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(testRoleName);
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("cell", { name: testRoleName, exact: true })).toBeVisible();
  await page.waitForTimeout(2000); // wait for saving of entity to finish
  await page.getByRole("link", { name: "Packit" }).click();

  return testRoleName;
};

export const doDownload = async (page: Page, downloadButton: Locator): Promise<Download> => {
  const downloadPromise = page.waitForEvent("download");
  await downloadButton.click();
  const download = await downloadPromise;

  // Wait for the download process to complete
  await download.path();

  return download;
};

export const readDownloadedFile = async (download: Download) => {
  const readStream = await download.createReadStream();
  let fileContents = "";
  readStream.on("readable", () => {
    let chunk: string;
    while (null !== (chunk = readStream.read())) {
      fileContents += chunk;
    }
  });
  await new Promise((resolve) => {
    readStream.on("end", resolve);
  });
  return fileContents;
};

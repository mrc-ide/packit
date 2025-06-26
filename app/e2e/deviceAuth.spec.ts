import { test, expect } from "./tagCheckFixture";
import { APPLICATION_JSON, PackitApiUtils } from "./apiUtils";

test.describe("Device auth", () => {
  test("can successfully authenticate with device flow", async ({ page, baseURL }) => {
    const apiUtils = new PackitApiUtils(baseURL);
    // 1. Make device auth request = get device code and user code
    const deviceAuthResponse = await apiUtils.post("/deviceAuth", null);
    expect(deviceAuthResponse.status).toBe(200);
    const { user_code, device_code, verification_uri } = await deviceAuthResponse.json();
    expect(user_code.length).toBe(9);
    expect(verification_uri).toBe(baseURL + "device");

    // 2. Validate user code at /device page
    await page.goto("/device");
    await page.keyboard.type(user_code);
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(await page.getByText("Success!")).toBeVisible();

    // 3. To check that validation has succeeded, get access token for device code
    const tokenResponse = await apiUtils.post(
      "/deviceAuth/token",
      `device_code=${device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code`,
      "application/x-www-form-urlencoded"
    );
    expect(tokenResponse.status).toBe(200);
    const { access_token } = await tokenResponse.json();

    // 4. Test that access token works by using it to fetch packet groups
    const groupsResponse = await apiUtils.get(
      "/packetGroupSummaries?pageNumber=0&pageSize=50&filter=",
      APPLICATION_JSON,
      access_token
    );
    expect(groupsResponse.status).toBe(200);
    const { content } = await groupsResponse.json();
    expect(content.length).toBeGreaterThan(0);
  });

  test("can see error message when enter invalid user code", async ({ page }) => {
    await page.goto("/device");
    await page.keyboard.type("BAAD-CODE");
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(await page.getByText("Code has expired or is not recognised.")).toBeVisible();
  });

  test("can paste code containing hyphens", async ({ browser, browserName }) => {
    const context = await browser.newContext()
    const isChromium = browserName === "chromium";
    if (isChromium) {
      await context.grantPermissions(["clipboard-write"])
    }
    const page = await context.newPage()
    await page.goto("/device");
    await page.evaluate(() => navigator.clipboard.writeText("ABCD-EFGH"));
    await page.keyboard.press("Control+v");
    const textbox = await page.getByRole("textbox");
    await expect(textbox).toHaveValue("ABCDEFGH");
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(await page.getByText("Code has expired or is not recognised.")).toBeVisible();
    await context.clearPermissions()
  });
});

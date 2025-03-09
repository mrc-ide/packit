import { test as setup, expect, Page } from "@playwright/test";

const authMethodIsBasic = async (apiURL: string) => {
  const response = await fetch(`${apiURL}/auth/config`);
  if (!response.ok) {
    throw Error(`Unable to get auth type from api. Status was ${response.status}`);
  }
  const json = await response.json();
  return json.enableBasicLogin;
};

const getBasicCredentials = () => {
  const user = process.env.PACKIT_E2E_BASIC_USER;
  const password = process.env.PACKIT_E2E_BASIC_PASSWORD;

  if (!user || !password) {
    throw Error(
      "This packitserver uses Basic auth. Please set environment variables " +
        "PACKIT_E2E_BASIC_USER and PACKIT_E2E_BASIC_PASSWORD"
    );
  }

  return [user, password];
};

const doBasicLogin = async (user: string, password: string, page: Page) => {
  await page.goto("./");
  await page.getByLabel("Email").fill(user);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /Log in/i }).click();
};

const doGithubLogin = async (page: Page, apiURL: string) => {
  // github PAT may be set in env, otherwise login to github interactively
  let githubToken = process.env.GITHUB_ACCESS_TOKEN;

  if (!githubToken) {
    const aod = await import("@octokit/auth-oauth-device"); // This package requires dynamic import with our ts config
    const auth = aod.createOAuthDeviceAuth({
      clientType: "oauth-app",
      clientId: "Ov23liUrbkR0qUtAO1zu", // Packit Oauth App
      scopes: ["read:org"],
      onVerification(verification) {
        console.log("Open %s", verification.verification_uri);
        console.log("Enter code: %s", verification.user_code);
      }
    });

    const tokenAuthentication = await auth({
      type: "oauth"
    });
    githubToken = tokenAuthentication.token;
  }

  const packitResponse = await fetch(`${apiURL}/auth/login/api`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: githubToken })
  });
  if (!packitResponse.ok) {
    throw Error(`Unable to get token from api. Status was ${packitResponse.status}`);
  }
  const json = await packitResponse.json();
  const packitToken = json.token;

  // Use redirect endpoint to login
  await page.goto(`./redirect?token=${packitToken}`);
};

// Define "setup" as a dependency for any test project which requires prior authentication
setup("authenticate", async ({ page, baseURL }, testInfo) => {
  console.log(`Authenticating with ${baseURL}`);
  // If baseURL is default localhost (used by CI),  we assume that we're running locally with api on
  // port 8080, otherwise that api is accessible from baseURL/api
  const apiURL = baseURL === "http://localhost:3000/" ? "http://localhost:8080" : `${baseURL}/packit/api`;
  const basicAuth = await authMethodIsBasic(apiURL);
  if (basicAuth) {
    const [basicUser, basicPassword] = getBasicCredentials();
    await doBasicLogin(basicUser, basicPassword, page); // get credentials interactively
  } else {
    await doGithubLogin(page, apiURL);
  }

  // Check login has succeeded - admin user should have user access role
  await expect(page.locator("body")).toHaveText(/Manage Access/);

  // write out context to tmp location to be picked up by dependent tests
  const authFile = testInfo.outputPath("auth.json");
  await page.context().storageState({ path: authFile });
});

import {test as setup, expect, Page} from "@playwright/test";
import * as prompt from "prompt";

const authMethodIsBasic = async (apiURL: string) => {
  const response = await fetch(`${apiURL}/auth/config`);
  const json = await response.json();
  return json.enableBasicLogin;
};

const getBasicCredentials = async () => {
  console.log("Please provide user credentials for running e2e tests. User will need to have admin permissions in Packit.");
  const {basicUser, password} = await prompt.get(["Username", "Password"]); // TODO: get password hidden?
  return [basicUser, password];
}

const doBasicLogin = async (user: string, password: string, page: Page) => {
  await page.goto("./");
  await page.getByLabel("Email").fill(user);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /Log in/i }).click();
}

const doGithubLogin = async (page: Page) => {
  const aod = await import("@octokit/auth-oauth-device"); // This package requires dynamic import with our ts config
  const auth = aod.createOAuthDeviceAuth({
    clientType: "github-app",
    clientId:"Ov23liUrbkR0qUtAO1zu", // Packit Github App
    onVerification(verification) {
      console.log("Open %s", verification.verification_uri);
      console.log("Enter code: %s", verification.user_code);
    },
  });

  const tokenAuthentication = await auth({
    type: "oauth",
  });
  const token = tokenAuthentication.token;

  // Use redirect endpoint to login
  await page.goto(`./redirect?token=${token}`);
}

// Define "setup" as a dependency for any test project which requires prior authentication
setup("authenticate", async ({ page, baseURL }, testInfo) => {
  console.log(`Authenticating with ${baseURL}`);
  // If baseURL is default localhost (used by CI), assume we should be using default credentials, otherwise get creds
  // interactively
  const useDefaults = baseURL === "http://localhost:3000/";
  // if we're using defaults, we assume that we're running locally with app on port 3000, and api on port 8080,
  // otherwise that api is accessible from baseURL/api
  const apiURL = useDefaults ? "http://localhost:8080" : `${baseURL}/api`;
  const basicAuth =  await authMethodIsBasic(apiURL);
  if (basicAuth) {
    const [ basicUser, basicPassword ] = useDefaults ? [ "resideUser@resideAdmin.ic.ac.uk", "password" ] : await getBasicCredentials();
    await doBasicLogin(basicUser, basicPassword, page); // get credentials interactively
  } else {
    await doGithubLogin(page);
  }

  // Check login has succeeded - admin user should have user access role
  await expect(page.locator("body")).toHaveText(/Manage Access/);

  // write out context to tmp location to be picked up by dependent tests
  const authFile = testInfo.outputPath("auth.json");
  await page.context().storageState({ path: authFile });
});

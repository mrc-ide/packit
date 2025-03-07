import { test as base } from "@playwright/test";

export const TAG_STATE_MUTATE = "@stateMutate";
export const TAG_DEMO_PACKETS = "@demoPackets";

const isLocal = (baseURL: string) => baseURL.startsWith("http://localhost");
const isDev = (baseURL: string) => baseURL.startsWith("https://packit-dev.dide.ic.ac.uk");

const safeGrep = `--grep-invert ${TAG_STATE_MUTATE}|${TAG_DEMO_PACKETS}`;

const checkStateMutateTag = (tags: string[], baseURL: string) => {
  if (tags.includes(TAG_STATE_MUTATE)) {
    if (isLocal(baseURL)) {
      return;
    }
    if (isDev(baseURL)) {
      console.warn(`Running server-mutating test against packit-dev. Consider running playwright with ${safeGrep}`);
    }
    // if anything else, throw
    throw Error(`Running server-mutating tests against unexpected server ${baseURL}. Run playwright with ${safeGrep}`);
  }
};

const checkDemoPacketsTag = (tags: string[], baseURL: string) => {
  if (tags.includes(TAG_DEMO_PACKETS)) {
    if (isLocal(baseURL)) {
      return;
    }
    console.warn(
      `Running test expecting demo packets against non-local server ${baseURL}. ` +
        `Consider running playwright with ${safeGrep}`
    );
  }
};

// This fixture attempts to put an additional guardrail against accidentally running mutating tests
// against production servers. When tests are run in such a way, they should exclude tests tagged
// @stateMutate and @demoDataset, but here we also check if running unexpeted combination of tag and server.
// Also warn if running demo dataset tests against non-localhost.
// All e2e tests should use this fixture.
export const test = base.extend<{ tagCheck: void }>({
  tagCheck: [
    async ({ baseURL }, use, testInfo) => {
      const tags = testInfo.tags;
      checkStateMutateTag(tags, baseURL);
      checkDemoPacketsTag(tags, baseURL);
      await use();
    },
    { auto: true }
  ]
});
export { expect } from "@playwright/test";

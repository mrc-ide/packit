export {};

describe("local storage keys", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test("local storage keys are namespaced correctly", () => {
    process.env.REACT_APP_SUB_URL_DEPTH = "2";
    const ns = "foo-bar";
    /* eslint-disable */
    const keys = require("../../../lib/types/LocalStorageKeys").LocalStorageKeys;
    expect(keys).toStrictEqual({
      AUTH_CONFIG: `${ns}.authConfig`,
      USER: `${ns}.user`,
      THEME: "ui-theme",
      REQUESTED_URL: `${ns}.requestedUrl`
    });
  });

  test("local storage keys are not namespaced when NAMESPACE unset", () => {
    delete process.env["REACT_APP_PACKIT_NAMESPACE"];
    /* eslint-disable */
    const keys = require("../../../lib/types/LocalStorageKeys").LocalStorageKeys;
    expect(keys).toStrictEqual({
      AUTH_CONFIG: "authConfig",
      USER: "user",
      THEME: "ui-theme",
      REQUESTED_URL: "requestedUrl"
    });
  });
});

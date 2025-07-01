export {};

describe("local storage keys", () => {
  const OLD_ENV = import.meta.env;

  beforeEach(() => {
    jest.resetModules(); // Important - it clears the cache
    import.meta.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    import.meta.env = OLD_ENV; // Restore old environment
  });

  test("local storage keys are namespaced correctly", () => {
    const ns = "test-ns";
    import.meta.env.VITE_PACKIT_NAMESPACE = ns;
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
    delete import.meta.env["VITE_PACKIT_NAMESPACE"];
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

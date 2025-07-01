export {};

describe("api service", () => {
  const OLD_ENV = import.meta.env;

  beforeEach(() => {
    jest.resetModules(); // Important - it clears the cache
    import.meta.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    import.meta.env = OLD_ENV; // Restore old environment
  });

  test("uses API URL from environment", () => {
    import.meta.env.VITE_PACKIT_API_URL = "http://localhost/foo/api";
    /* eslint-disable */
    const appConfig = require("../config/appConfig").default;
    /* eslint-enable */
    expect(appConfig.apiUrl()).toBe("http://localhost/foo/api");
  });

  test("throw error if environment variable is missing", () => {
    delete import.meta.env["VITE_PACKIT_API_URL"];
    /* eslint-disable */
    const appConfig = require("../config/appConfig").default;
    /* eslint-enable */
    expect(appConfig.apiUrl).toThrow();
  });

  test("uses PACKIT NAMESPACE from environment", () => {
    import.meta.env.VITE_PACKIT_NAMESPACE = "my-repo";
    /* eslint-disable */
    const appConfig = require("../config/appConfig").default;
    /* eslint-enable */
    expect(appConfig.appNamespace()).toBe("my-repo");
  });

  test("returns null when PACKIT NAMESPACE is missing", () => {
    delete import.meta.env["VITE_PACKIT_NAMESPACE"];
    /* eslint-disable */
    const appConfig = require("../config/appConfig").default;
    /* eslint-enable */
    expect(appConfig.appNamespace()).toBe(null);
  });
});

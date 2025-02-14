/* eslint-disable @typescript-eslint/no-var-requires */
export {};

describe("api service", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test("uses sub depth as expected", () => {
    const appConfig = require("../config/appConfig").default;

    process.env.REACT_APP_SUB_URL_DEPTH = "2";
    expect(appConfig.apiUrl()).toBe("/foo/bar/packit/api");

    process.env.REACT_APP_SUB_URL_DEPTH = "1";
    expect(appConfig.apiUrl()).toBe("/foo/packit/api");

    process.env.REACT_APP_SUB_URL_DEPTH = "0";
    expect(appConfig.apiUrl()).toBe("http://localhost:8080");
  });

  test("throw error if environment variable is missing", () => {
    const appConfig = require("../config/appConfig").default;

    delete process.env["REACT_APP_SUB_URL_DEPTH"];
    expect(appConfig.apiUrl).toThrow();
  });

  test("returns null when SUB_URL_DEPTH is 0", () => {
    const appConfig = require("../config/appConfig").default;

    process.env.REACT_APP_SUB_URL_DEPTH = "2";
    expect(appConfig.appNamespace()).toBe("foo-bar");

    process.env.REACT_APP_SUB_URL_DEPTH = "1";
    expect(appConfig.appNamespace()).toBe("foo");

    process.env.REACT_APP_SUB_URL_DEPTH = "0";
    expect(appConfig.appNamespace()).toBe(null);
  });

  test("returns correct github auth endpoint url", () => {
    const { default: appConfig, githubAuthEndpoint } = require("../config/appConfig");

    process.env.REACT_APP_SUB_URL_DEPTH = "2";
    expect(githubAuthEndpoint(appConfig)).toBe("/foo/bar/packit/api/oauth2/authorization/github");
  });

  test("returns correct public url", () => {
    const { publicUrl } = require("../config/appConfig");

    process.env.REACT_APP_SUB_URL_DEPTH = "2";
    expect(publicUrl("/foo/bar")).toBe("/foo/bar");

    process.env.REACT_APP_SUB_URL_DEPTH = "1";
    expect(publicUrl("/foo/bar")).toBe("/foo");

    process.env.REACT_APP_SUB_URL_DEPTH = "0";
    expect(publicUrl("/foo/bar")).toBe("/");
  });
});

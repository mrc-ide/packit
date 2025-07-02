import appConfig from "../config/appConfig";

describe("api service", () => {
  afterEach(() => {
    vitest.unstubAllEnvs();
  });
  test("uses API URL from environment", () => {
    vitest.stubEnv("VITE_PACKIT_API_URL", "http://localhost/foo/api");
    expect(appConfig.apiUrl()).toBe("http://localhost/foo/api");
  });

  test("throw error if environment variable is missing", () => {
    vitest.stubEnv("VITE_PACKIT_API_URL", undefined);

    expect(appConfig.apiUrl).toThrow();
  });

  test("uses PACKIT NAMESPACE from environment", () => {
    vitest.stubEnv("VITE_PACKIT_NAMESPACE", "my-repo");
    expect(appConfig.appNamespace()).toBe("my-repo");
  });

  test("returns null when PACKIT NAMESPACE is missing", () => {
    vitest.stubEnv("VITE_PACKIT_NAMESPACE", undefined);
    expect(appConfig.appNamespace()).toBe(null);
  });
});

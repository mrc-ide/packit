describe("storage keys", () => {
  afterEach(() => {
    vitest.unstubAllEnvs();
    vitest.resetModules();
  });

  test("storage keys are namespaced correctly", async () => {
    const ns = "test-ns";
    vitest.stubEnv("VITE_PACKIT_NAMESPACE", ns);

    const { StorageKeys } = await import("@lib/types/StorageKeys");

    expect(StorageKeys).toStrictEqual({
      AUTH_CONFIG: `${ns}.authConfig`,
      RUNNER_CONFIG: `${ns}.runnerConfig`,
      USER: `${ns}.user`,
      THEME: "ui-theme",
      REQUESTED_URL: `${ns}.requestedUrl`
    });
  });

  test("storage keys without namespace", async () => {
    vitest.stubEnv("VITE_PACKIT_NAMESPACE", "");

    const { StorageKeys } = await import("@lib/types/StorageKeys");

    expect(StorageKeys).toStrictEqual({
      AUTH_CONFIG: "authConfig",
      RUNNER_CONFIG: "runnerConfig",
      USER: "user",
      THEME: "ui-theme",
      REQUESTED_URL: "requestedUrl"
    });
  });
});

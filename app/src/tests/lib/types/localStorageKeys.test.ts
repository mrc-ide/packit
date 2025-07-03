describe("local storage keys", () => {
  afterEach(() => {
    vitest.unstubAllEnvs();
    vitest.resetModules();
  });

  test("local storage keys are namespaced correctly", async () => {
    const ns = "test-ns";
    vitest.stubEnv("VITE_PACKIT_NAMESPACE", ns);

    const { LocalStorageKeys } = await import("../../../lib/types/LocalStorageKeys");

    expect(LocalStorageKeys).toStrictEqual({
      AUTH_CONFIG: `${ns}.authConfig`,
      USER: `${ns}.user`,
      THEME: "ui-theme",
      REQUESTED_URL: `${ns}.requestedUrl`
    });
  });

  test("local storage keys without namespace", async () => {
    vitest.stubEnv("VITE_PACKIT_NAMESPACE", "");

    const { LocalStorageKeys } = await import("../../../lib/types/LocalStorageKeys");

    expect(LocalStorageKeys).toStrictEqual({
      AUTH_CONFIG: "authConfig",
      USER: "user",
      THEME: "ui-theme",
      REQUESTED_URL: "requestedUrl"
    });
  });
});

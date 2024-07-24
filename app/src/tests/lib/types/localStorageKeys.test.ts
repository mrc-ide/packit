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
        const ns = "test-ns";
        process.env.REACT_APP_PACKIT_NAMESPACE = ns;
        const keys = require("../../../lib/types/LocalStorageKeys").LocalStorageKeys;
        expect(keys).toStrictEqual({
            AUTH_CONFIG: `${ns}-authConfig`,
            USER: `${ns}-user`,
            THEME: "ui-theme",
            REQUESTED_URL: `${ns}-requestedUrl`
        })
    });

    test("local storage keys are not namespaced when NAMESPACE unset", () => {
        delete process.env["REACT_APP_PACKIT_NAMESPACE"];
        const keys = require("../../../lib/types/LocalStorageKeys").LocalStorageKeys;
        expect(keys).toStrictEqual({
            AUTH_CONFIG: "authConfig",
            USER: "user",
            THEME: "ui-theme",
            REQUESTED_URL: "requestedUrl"
        })
    });
});

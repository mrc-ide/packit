import appConfig from "../config/appConfig";

describe("api service", () => {

    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules(); // Important - it clears the cache
        process.env = { ...OLD_ENV }; // Make a copy
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    test("uses default config by default", () => {
        expect(appConfig.apiUrl()).toBe("http://localhost:8080");
    });

    test("uses production config if node_env is production", () => {
        /* eslint-disable */
        // @ts-ignore
        process.env.NODE_ENV = "production";
        const appConfig = require("../config/appConfig").default;
        /* eslint-enable */
        expect(appConfig.apiUrl()).toBe("https://localhost/packit/api");
    });
});


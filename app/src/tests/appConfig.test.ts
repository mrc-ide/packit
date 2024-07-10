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

    test("uses API URL from environment", () => {
        process.env.REACT_APP_PACKIT_API_URL = "http://localhost/foo/api";
        /* eslint-disable */
        const appConfig = require("../config/appConfig").default;
        /* eslint-enable */
        expect(appConfig.apiUrl()).toBe("http://localhost/foo/api");
    });

    test("throw error if environment variable is missing", () => {
        delete process.env["REACT_APP_PACKIT_API_URL"];
        /* eslint-disable */
        const appConfig = require("../config/appConfig").default;
        /* eslint-enable */
        expect(appConfig.apiUrl).toThrow();
    });
});


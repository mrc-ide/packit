import config from "../config/appConfig";

describe("api service", () => {

    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules() // Most important - it clears the cache
        process.env = { ...OLD_ENV }; // Make a copy
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    test("uses default config by default", () => {
        expect(config.apiUrl()).toBe("http://localhost:8080");
    });

    test("uses production config if node_env is production", () => {
        // Set the variables
        // @ts-ignore
        process.env.NODE_ENV = "production"
        const config = require("../config/appConfig").default

        expect(config.apiUrl()).toBe("https://localhost/packit/api");
    });
});


import {bytesToSize, getElapsedTime} from "../helpers";

describe("helpers", () => {

    test("can format time for minutes and seconds", () => {
        const time = {start: 1690302456, end: 1690302519};
        const formattedTime = getElapsedTime(time);
        expect(formattedTime).toBe(" 1 minute 3 seconds");
    });

    test("can format time for hours, minutes, and seconds", () => {
        const time = {start: 1690302456, end: 1690309519};
        const formattedTime = getElapsedTime(time);
        expect(formattedTime).toBe("1 hour 57 minutes 43 seconds");
    });

    test("can format time for seconds only", () => {
        const time = {start: 1630400000, end: 1630400005};
        const formattedTime = getElapsedTime(time);
        expect(formattedTime).toBe(" 5 seconds");
    });

    test("can format an empty string for zero elapsed time", () => {
        const time = {start: 1690302456, end: 1690302456};
        const formattedTime = getElapsedTime(time);
        expect(formattedTime).toBe("");
    });

    test("can format size in bytes", () => {
        const result = bytesToSize(42);
        expect(result).toBe("42 byte");
    });

    test("can format size in kilobytes", () => {
        const result = bytesToSize(1024);
        expect(result).toBe("1 kB");
    });

    test("can format size in megabytes", () => {
        const result = bytesToSize(1048576);
        expect(result).toBe("1 MB");
    });

    test("can format size in gigabytes", () => {
        const result = bytesToSize(1073741824);
        expect(result).toBe("1 GB");
    });

    test("can format size in terabytes", () => {
        const result = bytesToSize(1099511627776);
        expect(result).toBe("1 TB");
    });
});

import { parseNameFromQuery } from "../../../../../app/components/contents/packets/utils/parseNameFromQuery";

describe("parseNameFromQuery", () => {
  it("should extract name from valid query string", () => {
    expect(parseNameFromQuery('name == "testName"')).toBe("testName");
  });

  it("should return empty string when no name pattern is found", () => {
    expect(parseNameFromQuery('someOtherField == "value"')).toBe("");
  });

  it("should return empty string for empty input", () => {
    expect(parseNameFromQuery("")).toBe("");
  });

  it("should handle special characters in name", () => {
    expect(parseNameFromQuery('name == "test-name@123"')).toBe("test-name@123");
  });
});

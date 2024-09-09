import { parseParameterValue } from "../../../../../app/components/contents/runner/utils/parseParameterValue";

describe("parseParameterValue", () => {
  it("should return true for the string 'true'", () => {
    expect(parseParameterValue("true")).toBe(true);
  });

  it("should return false for the string 'false'", () => {
    expect(parseParameterValue("false")).toBe(false);
  });

  it("should return a number for numeric strings", () => {
    expect(parseParameterValue("123")).toBe(123);
    expect(parseParameterValue("0")).toBe(0);
    expect(parseParameterValue("-456")).toBe(-456);
  });

  it("should return the original string for non-numeric, non-boolean strings", () => {
    expect(parseParameterValue("hello")).toBe("hello");
    expect(parseParameterValue("123abc")).toBe("123abc");
  });

  it("should return null for an empty string", () => {
    expect(parseParameterValue("")).toBe(null);
  });
});

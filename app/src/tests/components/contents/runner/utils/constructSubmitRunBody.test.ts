import { GitBranchInfo } from "../../../../../app/components/contents/runner/types/GitBranches";
import {
  constructSubmitRunBody,
  parseParameterValue
} from "../../../../../app/components/contents/runner/utils/constructSubmitRunBody";

describe("constructSubmitRunBody", () => {
  const branchInfo: GitBranchInfo = { name: "main", commitHash: "abc123", time: 123456, message: [] };

  it("should handle empty parameters", () => {
    const result = constructSubmitRunBody([], "testPacket", branchInfo);
    expect(result).toEqual({
      name: "testPacket",
      branch: "main",
      hash: "abc123"
    });
  });

  it("should handle non-empty parameters", () => {
    const parameters = [
      { name: "param1", value: "true" },
      { name: "param2", value: "123" },
      { name: "param3", value: "hello" }
    ];
    const result = constructSubmitRunBody(parameters, "testPacket", branchInfo);
    expect(result).toEqual({
      name: "testPacket",
      branch: "main",
      hash: "abc123",
      parameters: {
        param1: true,
        param2: 123,
        param3: "hello"
      }
    });
  });

  it("should handle different types of parameter values", () => {
    const parameters = [
      { name: "param1", value: "true" },
      { name: "param2", value: "false" },
      { name: "param3", value: "123" },
      { name: "param5", value: "hello" }
    ];
    const result = constructSubmitRunBody(parameters, "testPacket", branchInfo);
    expect(result).toEqual({
      name: "testPacket",
      branch: "main",
      hash: "abc123",
      parameters: {
        param1: true,
        param2: false,
        param3: 123,
        param5: "hello"
      }
    });
  });

  it("should handle missing optional fields", () => {
    const parameters = [{ name: "param1", value: "true" }];
    const result = constructSubmitRunBody(parameters, "testPacket", branchInfo);
    expect(result).toEqual({
      name: "testPacket",
      branch: "main",
      hash: "abc123",
      parameters: {
        param1: true
      }
    });
  });

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

    it("should return throw error for an empty string", () => {
      expect(() => parseParameterValue("")).toThrow("Value cannot be null.");
    });
  });
});

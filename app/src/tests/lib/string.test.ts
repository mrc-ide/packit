import { getInitials } from "../../lib/string";

describe("getInitials", () => {
  it("throws an error if name is empty", () => {
    expect(() => {
      getInitials("");
    }).toThrowError("Name cannot be empty");
  });

  it("throws an error if name format is invalid", () => {
    expect(() => {
      getInitials("John");
    }).toThrowError("Invalid name format");

    expect(() => {
      getInitials("Doe");
    }).toThrowError("Invalid name format");
  });

  it("returns the correct initials", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Alice Smith")).toBe("AS");
    expect(getInitials("Bob Johnson")).toBe("BJ");
  });
});

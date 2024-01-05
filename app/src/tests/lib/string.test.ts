import { getInitials } from "../../lib/string";

describe("getInitials", () => {
  it("returns XX if name is empty", () => {
    expect(getInitials("")).toBe("XX");
  });

  it("returns XX if name format is invalid", () => {
    expect(getInitials("John")).toBe("XX");
    expect(getInitials("Doe")).toBe("XX");
  });

  it("returns the correct initials", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Alice Smith")).toBe("AS");
    expect(getInitials("Bob Johnson")).toBe("BJ");
  });
});

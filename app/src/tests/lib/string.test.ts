import { getInitials, kebabToSentenceCase } from "@lib/string";

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

describe("kebabToSentenceCase", () => {
  it("returns the same string if there is no hyphen", () => {
    expect(kebabToSentenceCase("hello")).toBe("hello");
  });

  it("replaces hyphens with spaces", () => {
    expect(kebabToSentenceCase("hello-world")).toBe("hello world");
  });

  it("handles multiple hyphens", () => {
    expect(kebabToSentenceCase("hello-world-this-is-a-test")).toBe("hello world this is a test");
  });

  it("handles empty strings", () => {
    expect(kebabToSentenceCase("")).toBe("");
  });
});

import { kebabToSentenceCase } from "../../lib/string";

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

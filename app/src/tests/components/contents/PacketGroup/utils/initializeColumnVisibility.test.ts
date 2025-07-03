import { initializeColumnVisibility } from "@components/contents/PacketGroup/utils/initializeColumnVisibility";

describe("initializeColumnVisibility", () => {
  it("should return empty object for empty parameter set", () => {
    const emptySet = new Set<string>();
    const result = initializeColumnVisibility(emptySet);
    expect(result).toEqual({ parameters: true });
  });

  it("should initialize single parameter visibility to false", () => {
    const singleParam = new Set(["param1"]);
    const result = initializeColumnVisibility(singleParam);
    expect(result).toEqual({
      parameters_param1: false,
      parameters: true
    });
  });

  it("should initialize multiple parameters visibility to false", () => {
    const multipleParams = new Set(["param1", "param2", "param3"]);
    const result = initializeColumnVisibility(multipleParams);
    expect(result).toEqual({
      parameters_param1: false,
      parameters_param2: false,
      parameters_param3: false,
      parameters: true
    });
  });
});

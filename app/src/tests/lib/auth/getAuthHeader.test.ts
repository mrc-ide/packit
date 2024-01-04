import { getAuthHeader } from "../../../lib/auth/getAuthHeader";

const mockAuthConfig = jest.fn();
jest.mock("../../../lib/localStorageManager", () => ({
  getAuthConfigFromLocalStorage: () => mockAuthConfig()
}));
jest.mock("../../../lib/auth/getBearerToken", () => ({
  getBearerToken: () => "12345"
}));

describe("getAuthHeader", () => {
  it("shoudl return auth header if bearer token present and authconfig present", () => {
    mockAuthConfig.mockReturnValue({ enableAuth: true });
    const result = getAuthHeader();
    expect(result).toEqual({
      Authorization: "Bearer 12345"
    });
  });
  it("shoudl return undefined if bearer token present and authconfig not present", () => {
    mockAuthConfig.mockReturnValue({ enableAuth: false });
    const result = getAuthHeader();
    expect(result).toEqual(undefined);
  });
});

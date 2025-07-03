import { UserState } from "../../../app/components/providers/types/UserTypes";
import { getBearerToken } from "../../../lib/auth/getBearerToken";

const mockGetUserFromLocalStorage = vitest.fn((): null | UserState => null);
vitest.mock("../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));
vitest.unmock("../../../lib/auth/getBearerToken");

const mockResponse = vitest.fn();
Object.defineProperty(window, "location", {
  value: {
    hash: {
      endsWith: mockResponse,
      includes: mockResponse
    },
    assign: mockResponse
  },
  writable: true
});

describe("getBearerToken", () => {
  it("should return the bearer token if it exists", () => {
    const user = { token: "testToken" } as UserState;
    mockGetUserFromLocalStorage.mockReturnValueOnce(user);

    const result = getBearerToken();

    expect(result).toBe(user.token);
  });

  it("should throw an error if no token exists", () => {
    mockGetUserFromLocalStorage.mockReturnValueOnce(null);

    expect(() => {
      getBearerToken();
    }).toThrow("No bearer token found");
  });
});

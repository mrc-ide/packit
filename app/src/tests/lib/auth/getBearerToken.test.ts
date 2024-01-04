import { UserState } from "../../../app/components/providers/types/UserTypes";
import { getBearerToken } from "../../../lib/auth/getBearerToken";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));
jest.unmock("../../../lib/auth/getBearerToken");

const mockResponse = jest.fn();
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
  it("should return the bearer token if it exists and is not expired", () => {
    const user = {
      token: "testToken",
      exp: Math.floor(Date.now() / 1000) + 3600 // expires in 1 hour
    } as UserState;
    mockGetUserFromLocalStorage.mockReturnValueOnce(user);

    const result = getBearerToken();

    expect(result).toBe(user.token);
  });

  it("should remove the user from local storage and redirect to login page if bearer token is not found", () => {
    mockGetUserFromLocalStorage.mockReturnValueOnce(null);
    expect(() => {
      getBearerToken();
    }).toThrow("No bearer token found");

    expect(localStorage.getItem("user")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("should remove the user from local storage and redirect to login page if bearer token is expired", () => {
    const user = {
      token: "testToken",
      exp: Math.floor(Date.now() / 1000) - 3600 // expired 1 hour ago
    } as UserState;
    mockGetUserFromLocalStorage.mockReturnValueOnce(user);

    expect(() => {
      getBearerToken();
    }).toThrow("No bearer token found");

    expect(window.location.href).toBe("/login");
  });
});

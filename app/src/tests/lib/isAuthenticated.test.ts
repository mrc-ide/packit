import { AuthConfig } from "../../app/components/providers/types/AuthConfigTypes";
import { authIsExpired, isAuthenticated } from "../../lib/isAuthenticated";
import { mockUserState, mockExpiredUserState } from "../mocks";

describe("isAuthenticated", () => {
  it("returns true if authConfig.enableAuth is false", () => {
    const authConfig = { enableAuth: false } as AuthConfig;
    expect(isAuthenticated(authConfig, mockUserState())).toBe(true);
  });

  it("returns true if authConfig.enableAuth is true and user.token exists", () => {
    const authConfig = { enableAuth: true } as AuthConfig;
    expect(isAuthenticated(authConfig, mockUserState())).toBe(true);
  });

  it("returns false if authConfig is null", () => {
    const authConfig = null;
    expect(isAuthenticated(authConfig, mockUserState())).toBe(false);
  });

  it("returns false if the token is expired", () => {
    const authConfig = { enableAuth: true } as AuthConfig;
    expect(isAuthenticated(authConfig, mockExpiredUserState())).toBe(false);
  });

  it("returns false if both authConfig and user are null", () => {
    const authConfig = null;
    const user = null;
    expect(isAuthenticated(authConfig, user)).toBe(false);
  });

  it("returns false if authConfig is present and user is null", () => {
    const authConfig = { enableAuth: true } as AuthConfig;
    const user = null;
    expect(isAuthenticated(authConfig, user)).toBe(false);
  });
});

describe("authIsExpired", () => {
  it("returns true if user is null", () => {
    expect(authIsExpired(null)).toBe(true);
  });

  it("returns true if user.exp is in the past", () => {
    expect(authIsExpired(mockExpiredUserState())).toBe(true);
  });

  it("returns false if user.exp is in the future", () => {
    expect(authIsExpired(mockUserState())).toBe(false);
  });
});

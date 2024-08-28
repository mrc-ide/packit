import { AuthConfig } from "../../app/components/providers/types/AuthConfigTypes";
import { isAuthenticated } from "../../lib/isAuthenticated";
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
});

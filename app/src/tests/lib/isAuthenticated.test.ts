import { AuthConfig } from "../../app/components/providers/types/AuthConfigTypes";
import { UserState } from "../../app/components/providers/types/UserTypes";
import { isAuthenticated } from "../../lib/isAuthenticated";

const validUserState = () => ({
  token: "abc123",
  exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
} as UserState);

const expiredUserState = () => ({
  token: "abc123",
  exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
} as UserState);

describe("isAuthenticated", () => {
  it("returns true if authConfig.enableAuth is false", () => {
    const authConfig = { enableAuth: false } as AuthConfig;
    expect(isAuthenticated(authConfig, validUserState())).toBe(true);
  });

  it("returns true if authConfig.enableAuth is true and user.token exists", () => {
    const authConfig = { enableAuth: true } as AuthConfig;
    expect(isAuthenticated(authConfig, validUserState())).toBe(true);
  });

  it("returns false if authConfig is null", () => {
    const authConfig = null;
    expect(isAuthenticated(authConfig, validUserState())).toBe(false);
  });

  it("returns false if the token is expired", () => {
    const authConfig = { enableAuth: true } as AuthConfig;
    expect(isAuthenticated(authConfig, expiredUserState())).toBe(false);
  });

  it("returns false if both authConfig and user are null", () => {
    const authConfig = null;
    const user = null;
    expect(isAuthenticated(authConfig, user)).toBe(false);
  });
});

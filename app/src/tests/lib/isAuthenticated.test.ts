import { AuthConfig } from "../../app/components/providers/types/AuthConfigTypes";
import { UserState } from "../../app/components/providers/types/UserTypes";
import { isAuthenticated } from "../../lib/isAuthenticated";

describe("isAuthenticated", () => {
  it("returns true if authConfig.enableAuth is false", () => {
    const authConfig = { enableAuth: false } as AuthConfig;
    const user = {
      token: "abc123",
      exp: Math.floor(Date.now() / 1000) + 3600 // expires in 1 hour
    } as UserState;
    expect(isAuthenticated(authConfig, user)).toBe(true);
  });

  it("returns true if authConfig.enableAuth is true and user.token exists", () => {
    const authConfig = { enableAuth: true } as AuthConfig;
    const user = {
      token: "abc123",
      exp: Math.floor(Date.now() / 1000) + 3600 // expires in 1 hour
    } as UserState;
    expect(isAuthenticated(authConfig, user)).toBe(true);
  });

  it("returns false if the token is expired", () => {
    const authConfig = {
      enableAuth: true,
      exp: Math.floor(Date.now() / 1000) - 3600 // expired 1 hour ago
    } as AuthConfig;
    const user = { token: "abc123" } as UserState;
  });

  it("returns false if authConfig is null", () => {
    const authConfig = null;
    const user = { token: "abc123" } as UserState;
    expect(isAuthenticated(authConfig, user)).toBe(false);
  });

  it("returns false if both authConfig and user are null", () => {
    const authConfig = null;
    const user = null;
    expect(isAuthenticated(authConfig, user)).toBe(false);
  });
});

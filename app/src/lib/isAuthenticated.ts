import { AuthConfig } from "../app/components/providers/types/AuthConfigTypes";
import { UserState } from "../app/components/providers/types/UserTypes";

export const authIsExpired = (user: UserState | null): boolean =>
  !user?.exp || user?.exp * 1000 < Date.now()

export const isAuthenticated = (authConfig: AuthConfig | null, user: UserState | null): boolean =>
  authConfig?.enableAuth === false || !!(authConfig?.enableAuth && user?.token && !authIsExpired(user));

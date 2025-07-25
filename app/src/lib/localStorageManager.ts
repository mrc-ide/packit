import type { AuthConfig } from "@components/providers/types/AuthConfigTypes";
import type { UserState } from "@components/providers/types/UserTypes";
import { LocalStorageKeys } from "./types/LocalStorageKeys";

export const getUserFromLocalStorage = (): UserState | null => {
  const user = localStorage.getItem(LocalStorageKeys.USER);
  return user ? JSON.parse(user) : null;
};
export const getAuthConfigFromLocalStorage = (): AuthConfig | null => {
  const authConfig = localStorage.getItem(LocalStorageKeys.AUTH_CONFIG);
  return authConfig ? JSON.parse(authConfig) : null;
};

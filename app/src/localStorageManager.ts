import { AuthConfig } from "./app/components/providers/types/AuthConfigTypes";
import { UserState } from "./app/components/providers/types/UserTypes";

export const LocalStorageKeys = {
  AUTH_CONFIG: "authConfig",
  USER: "user",
  THEME: "ui-theme"
};

export const getUserFromLocalStorage = (): UserState | null => {
  const user = localStorage.getItem(LocalStorageKeys.USER);
  return user ? JSON.parse(user) : null;
};
export const getAuthConfigFromLocalStorage = (): AuthConfig | null => {
  const authConfig = localStorage.getItem(LocalStorageKeys.AUTH_CONFIG);
  return authConfig ? JSON.parse(authConfig) : null;
};

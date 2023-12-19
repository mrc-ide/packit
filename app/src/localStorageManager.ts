import { AuthConfig } from "./app/components/providers/types/AuthConfigTypes";
import { UserState } from "./app/components/providers/types/UserTypes";
import { CurrentUser } from "./types";

export const CURRENT_USER = "user"; // TODO: delete
export const LocalStorageKeys = {
  AUTH_CONFIG: "authConfig",
  USER: "user",
  THEME: "ui-theme"
};

// todo: remove
export const getCurrentUser = (): CurrentUser => {
  const user = localStorage.getItem(LocalStorageKeys.USER);
  return user ? JSON.parse(user) : null;
};
export const saveCurrentUser = (user: CurrentUser) => {
  localStorage.removeItem(LocalStorageKeys.USER);
  localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(user));
};

export const removeCurrentUser = () => {
  if (getCurrentUser()) {
    localStorage.removeItem(LocalStorageKeys.USER);
  }
};

export const getUserFromLocalStorage = (): UserState | null => {
  const user = localStorage.getItem(LocalStorageKeys.USER);
  return user ? JSON.parse(user) : null;
};
export const getAuthConfigFromLocalStorage = (): AuthConfig | null => {
  const authConfig = localStorage.getItem(LocalStorageKeys.AUTH_CONFIG);
  return authConfig ? JSON.parse(authConfig) : null;
};

import type { AuthConfig } from "@components/providers/types/AuthConfigTypes";
import type { UserState } from "@components/providers/types/UserTypes";
import { StorageKeys } from "./types/StorageKeys";

export const getUserFromLocalStorage = (): UserState | null => {
  const user = localStorage.getItem(StorageKeys.USER);
  return user ? JSON.parse(user) : null;
};
export const setUserInLocalStorage = (user: UserState) => {
  localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
};
export const removeUserFromLocalStorage = () => {
  localStorage.removeItem(StorageKeys.USER);
};
export const getAuthConfigFromLocalStorage = (): AuthConfig | null => {
  const authConfig = localStorage.getItem(StorageKeys.AUTH_CONFIG);
  return authConfig ? JSON.parse(authConfig) : null;
};
export const setAuthConfigInLocalStorage = (authConfig: AuthConfig) => {
  localStorage.setItem(StorageKeys.AUTH_CONFIG, JSON.stringify(authConfig));
};
export const getRunnerConfigFromSessionStorage = (): boolean | null => {
  const runnerConfig = sessionStorage.getItem(StorageKeys.RUNNER_CONFIG);
  return runnerConfig !== null ? JSON.parse(runnerConfig) : null;
};
export const setRunnerConfigInSessionStorage = (isRunnerEnabled: boolean) => {
  sessionStorage.setItem(StorageKeys.RUNNER_CONFIG, JSON.stringify(isRunnerEnabled));
};
export const getThemeFromLocalStorage = () => localStorage.getItem(StorageKeys.THEME);
export const setThemeInLocalStorage = (theme: string) => {
  localStorage.setItem(StorageKeys.THEME, theme);
};
export const removeThemeFromLocalStorage = () => {
  localStorage.removeItem(StorageKeys.THEME);
};
export const getRequestedUrlFromLocalStorage = () => localStorage.getItem(StorageKeys.REQUESTED_URL);
export const setRequestedUrlInLocalStorage = (url: string | null) => {
  if (url === null) {
    localStorage.removeItem(StorageKeys.REQUESTED_URL);
  } else {
    localStorage.setItem(StorageKeys.REQUESTED_URL, url);
  }
};

import type { AuthConfig } from "@components/providers/types/AuthConfigTypes";
import type { UserState } from "@components/providers/types/UserTypes";
import { StorageKeys } from "./types/StorageKeys";

export const getUserFromLocalStorage = (): UserState | null => {
  const user = localStorage.getItem(StorageKeys.USER);
  return user ? JSON.parse(user) : null;
};
export const getAuthConfigFromLocalStorage = (): AuthConfig | null => {
  const authConfig = localStorage.getItem(StorageKeys.AUTH_CONFIG);
  return authConfig ? JSON.parse(authConfig) : null;
};
export const getRunnerConfigFromSessionStorage = (): boolean | null => {
  const runnerConfig = sessionStorage.getItem(StorageKeys.RUNNER_CONFIG);
  return runnerConfig !== null ? JSON.parse(runnerConfig) : null;
};

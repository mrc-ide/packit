import type { UserState } from "@components/providers/types/UserTypes";
import type { AuthConfig } from "@components/providers/types/AuthConfigTypes";
import {
  getAuthConfigFromLocalStorage,
  getRequestedUrlFromLocalStorage,
  getRunnerConfigFromSessionStorage,
  getThemeFromLocalStorage,
  getUserFromLocalStorage,
  removeThemeFromLocalStorage,
  removeUserFromLocalStorage,
  setAuthConfigInLocalStorage,
  setRequestedUrlInLocalStorage,
  setRunnerConfigInSessionStorage,
  setThemeInLocalStorage,
  setUserInLocalStorage
} from "@lib/storageManager";
import { StorageKeys } from "@lib/types/StorageKeys";

describe("storageManager", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stores and reads user in localStorage", () => {
    const user = { token: "token", displayName: "name", userName: "u", exp: 1893456000 } as UserState;
    setUserInLocalStorage(user);

    expect(getUserFromLocalStorage()).toStrictEqual(user);
  });

  it("removes user from localStorage", () => {
    localStorage.setItem(StorageKeys.USER, JSON.stringify({ token: "token" }));
    removeUserFromLocalStorage();

    expect(localStorage.getItem(StorageKeys.USER)).toBe(null);
  });

  it("stores and reads auth config in localStorage", () => {
    const authConfig = { enableAuth: true, enableGithubLogin: false } as AuthConfig;
    setAuthConfigInLocalStorage(authConfig);

    expect(getAuthConfigFromLocalStorage()).toStrictEqual(authConfig);
  });

  it("stores and reads runner config in sessionStorage", () => {
    setRunnerConfigInSessionStorage(true);

    expect(getRunnerConfigFromSessionStorage()).toBe(true);
  });

  it("stores, reads, and removes theme in localStorage", () => {
    setThemeInLocalStorage("dark");
    expect(getThemeFromLocalStorage()).toBe("dark");

    removeThemeFromLocalStorage();
    expect(getThemeFromLocalStorage()).toBe(null);
  });

  it("stores, reads, and removes requested URL in localStorage", () => {
    const url = "/runner/logs";
    setRequestedUrlInLocalStorage(url);
    expect(getRequestedUrlFromLocalStorage()).toBe(url);

    setRequestedUrlInLocalStorage(null);
    expect(getRequestedUrlFromLocalStorage()).toBe(null);
    expect(localStorage.getItem(StorageKeys.REQUESTED_URL)).toBe(null);
  });
});

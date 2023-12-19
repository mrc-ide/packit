import { LocalStorageKeys, getUserFromLocalStorage } from "../localStorageManager";

export const getBearerToken = () => {
  const user = getUserFromLocalStorage();

  if (!user?.token || user?.exp * 1000 < Date.now()) {
    localStorage.removeItem(LocalStorageKeys.USER);
    window.location.href = "/login";
    throw new Error("No bearer token found");
  }

  return user.token;
};

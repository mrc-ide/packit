import { getAuthConfigFromLocalStorage } from "../localStorageManager";
import { getBearerToken } from "./getBearerToken";

export const getAuthHeader = () => {
  const authConfig = getAuthConfigFromLocalStorage();

  if (!authConfig?.enableAuth) {
    return undefined;
  }

  return { Authorization: `Bearer ${getBearerToken()}` };
};

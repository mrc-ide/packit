import { getCurrentUser } from "../../localStorageManager";

export const getBearerToken = () => {
  return getCurrentUser()?.token;
};

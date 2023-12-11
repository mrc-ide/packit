import { getCurrentUser } from "../../localStorageManager";

export const getBearerToken = () => {
  const token = getCurrentUser()?.token;
  if (!token) {
    throw new Error("No bearer token found");
  }
  return token;
};

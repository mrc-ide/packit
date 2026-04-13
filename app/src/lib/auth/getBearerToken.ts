import { getUserFromLocalStorage } from "../storageManager";

export const getBearerToken = () => {
  const user = getUserFromLocalStorage();

  if (!user?.token) {
    throw new Error("No bearer token found");
  }
  return user.token;
};

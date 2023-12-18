import { getCurrentUser } from "../localStorageManager";

export const getBearerToken = () => {
  // TOO:need to validate current token as well? check if expired...
  // if yes maybe log out? Note: in no auth mode should not be needed
  const token = getCurrentUser()?.token;

  if (!token) {
    throw new Error("No bearer token found");
  }
  return token;
};

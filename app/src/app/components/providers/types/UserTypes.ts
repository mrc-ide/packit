import { CurrentUser } from "../../../../types";

// TODO: just check if user in state?? user error can we put in search params?
// add user details to user state from jwt
export interface UserProviderState {
  user: CurrentUser | undefined;
  setUser: (user: CurrentUser) => void;
  removeUser: () => void;
}

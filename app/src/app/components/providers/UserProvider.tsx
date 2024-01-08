import { jwtDecode } from "jwt-decode";
import { ReactNode, createContext, useContext, useState } from "react";
import { getUserFromLocalStorage } from "../../../lib/localStorageManager";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";
import { PacketJwtPayload } from "../../../types";
import { UserProviderState, UserState } from "./types/UserTypes";
import {SessionStorageKeys} from "../../../lib/types/SessionStorageKeys";

const UserContext = createContext<UserProviderState | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) throw new Error("useUser must be used within a UserProvider");

  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userState, setUserState] = useState<UserState | null>(() => getUserFromLocalStorage());
  const [requestedUrl, setRequestedUrlState] =
      useState<string | null>(() => localStorage.getItem(SessionStorageKeys.REQUESTED_URL));
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const value = {
    user: userState,
    setUser(jwt: string) {
      const jwtPayload = jwtDecode<PacketJwtPayload>(jwt);
      const user: UserState = {
        token: jwt,
        exp: jwtPayload.exp?.valueOf() ?? 0,
        displayName: jwtPayload.displayName ?? "",
        userName: jwtPayload.userName ?? ""
      };
      setUserState(user);
      localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(user));
    },
    removeUser() {
      setUserState(null);
      localStorage.removeItem(LocalStorageKeys.USER);
    },
    requestedUrl,
    setRequestedUrl(url: string | null) {
      setRequestedUrlState(url);
      const key = SessionStorageKeys.REQUESTED_URL;
      if (url === null) {
        //alert("removing item from session storage")
        //console.log("removing item from session storage")
        localStorage.removeItem(key)
      } else {
        //alert(`setting session storage value to ${url}`)
        //console.log(`setting session storage value to ${url}`)
        localStorage.setItem(key, url);
        // Make sure it's saved the bloody thing
        //const testVal = sessionStorage.getItem(key);
        //console.log(`Retrieved session storage value is ${testVal}`)
        //alert("SAVED IT!")
      }
    },
    loggingOut,
    setLoggingOut
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

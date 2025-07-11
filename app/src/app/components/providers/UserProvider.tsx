import { jwtDecode } from "jwt-decode";
import { ReactNode, createContext, useContext, useState } from "react";
import { getUserFromLocalStorage } from "@lib/localStorageManager";
import { LocalStorageKeys } from "@lib/types/LocalStorageKeys";
import { PacketJwtPayload } from "@/types";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { useGetUserAuthorities } from "./hooks/useGetUserAuthorities";
import { UserProviderState, UserState } from "./types/UserTypes";

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
  const { authorities, error } = useGetUserAuthorities(userState);

  const value = {
    user: userState,
    authorities,
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
    }
  };

  if (error) return <ErrorComponent message="failed to load user authorities" error={error} />;

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

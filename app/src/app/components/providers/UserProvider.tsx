import { ReactNode, createContext, useContext, useState } from "react";
import { CurrentUser } from "../../../types";
import { UserProviderState } from "./types/UserTypes";

const UserContext = createContext<UserProviderState | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) throw new Error("useUser must be used within a UserProvider");

  return context;
};

interface UserProviderProps {
  children: ReactNode;
  storageKey?: string;
}

export const UserProvider = ({ children, storageKey = "user" }: UserProviderProps) => {
  const [userState, setUserState] = useState<CurrentUser | undefined>(() =>
    localStorage.getItem(storageKey) ? JSON.parse(localStorage.getItem(storageKey) ?? "{}") : undefined
  );

  const value = {
    user: userState,
    setUser(user: CurrentUser) {
      setUserState(user);
      localStorage.setItem(storageKey, JSON.stringify(user));
    },
    removeUser() {
      setUserState(undefined);
      localStorage.removeItem(storageKey);
    }
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

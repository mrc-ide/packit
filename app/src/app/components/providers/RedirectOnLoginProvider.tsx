import { createContext, ReactNode, useContext, useState } from "react";
import { RedirectOnLoginProviderState } from "./types/UserTypes";
import {
  getRequestedUrlFromLocalStorage,
  removeRequestedUrlFromLocalStorage,
  setRequestedUrlInLocalStorage
} from "@/lib/storageManager";

const RedirectOnLoginContext = createContext<RedirectOnLoginProviderState | undefined>(undefined);

export const useRedirectOnLogin = () => {
  const context = useContext(RedirectOnLoginContext);

  if (context === undefined) throw new Error("useRedirectOnLogin must be used within a RedirectOnLoginProvider");

  return context;
};

interface RedirectOnLoginProviderProps {
  children: ReactNode;
}

export const RedirectOnLoginProvider = ({ children }: RedirectOnLoginProviderProps) => {
  // NB We use local storage to store requested url rather than SessionStorage as Chrome is unreliable at
  // maintaining session keys for lifetime of tab.
  const [requestedUrl, setRequestedUrlState] = useState<string | null>(() => getRequestedUrlFromLocalStorage());
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const value = {
    requestedUrl,
    setRequestedUrl(url: string | null) {
      setRequestedUrlState(url);
      if (url === null) {
        removeRequestedUrlFromLocalStorage();
      } else {
        setRequestedUrlInLocalStorage(url);
      }
    },
    loggingOut,
    setLoggingOut
  };

  return <RedirectOnLoginContext.Provider value={value}>{children}</RedirectOnLoginContext.Provider>;
};

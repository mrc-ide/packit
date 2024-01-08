import {createContext, ReactNode, useContext, useState} from "react";
import {RedirectOnLoginProviderState} from "./types/UserTypes";
import {LocalStorageKeys} from "../../../lib/types/LocalStorageKeys";

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
    // NB We use local storage to store requested url rather than SessionStorage as Chrome was unreliable at
    // maintaining session keys for lifetime of tab.
    const [requestedUrl, setRequestedUrlState] =
        useState<string | null>(() => localStorage.getItem(LocalStorageKeys.REQUESTED_URL));
    const [loggingOut, setLoggingOut] = useState<boolean>(false);

    const value = {
        requestedUrl,
        setRequestedUrl(url: string | null) {
            setRequestedUrlState(url);
            const key = LocalStorageKeys.REQUESTED_URL;
            url === null ? localStorage.removeItem(key) : localStorage.setItem(key, url);
        },
        loggingOut,
        setLoggingOut
    };

    return <RedirectOnLoginContext.Provider value={value}>{children}</RedirectOnLoginContext.Provider>;
};

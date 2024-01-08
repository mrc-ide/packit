import {createContext, ReactNode, useContext, useState} from "react";
import {RedirectOnLoginProviderState} from "./types/UserTypes";
import {SessionStorageKeys} from "../../../lib/types/SessionStorageKeys";

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
    const [requestedUrl, setRequestedUrlState] =
        useState<string | null>(() => localStorage.getItem(SessionStorageKeys.REQUESTED_URL));
    const [loggingOut, setLoggingOut] = useState<boolean>(false);

    const value = {
        requestedUrl,
        setRequestedUrl(url: string | null) {
            setRequestedUrlState(url);
            const key = SessionStorageKeys.REQUESTED_URL;
            url === null ? localStorage.removeItem(key) : localStorage.setItem(key, url);
        },
        loggingOut,
        setLoggingOut
    };

    return <RedirectOnLoginContext.Provider value={value}>{children}</RedirectOnLoginContext.Provider>;
};

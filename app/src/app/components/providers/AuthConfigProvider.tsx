import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import appConfig from "../../../config/appConfig";
import { fetcher } from "../../../lib/fetch";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { AuthConfig } from "./types/AuthConfigTypes";

const AuthConfigContext = createContext<AuthConfig | undefined>(undefined);

export const useAuthConfig = () => useContext(AuthConfigContext);

interface AuthConfigProviderProps {
  children: ReactNode;
  storageKey?: string;
}

export const AuthConfigProvider = ({ children, storageKey = "authConfig" }: AuthConfigProviderProps) => {
  const [authConfig, setAuthConfig] = useState<AuthConfig | undefined>(() =>
    localStorage.getItem(storageKey) ? JSON.parse(localStorage.getItem(storageKey) ?? "{}") : undefined
  );

  const { data, error } = useSWR<AuthConfig>(
    !authConfig ? `${appConfig.apiUrl()}/auth/config` : null,
    (url: string) => fetcher({ url }),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (data) {
      setAuthConfig(data);
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }, [data]);

  if (error) return <ErrorComponent message="failed to load auth config" error={error} />;

  return <AuthConfigContext.Provider value={authConfig}>{children}</AuthConfigContext.Provider>;
};

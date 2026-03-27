import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getAuthConfigFromLocalStorage, setAuthConfigInLocalStorage } from "@lib/storageManager";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { useGetAuthConfig } from "./hooks/useGetAuthConfig";
import { AuthConfig } from "./types/AuthConfigTypes";

const AuthConfigContext = createContext<AuthConfig | null>(null);

export const useAuthConfig = () => useContext(AuthConfigContext);

interface AuthConfigProviderProps {
  children: ReactNode;
}

export const AuthConfigProvider = ({ children }: AuthConfigProviderProps) => {
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(() => getAuthConfigFromLocalStorage());
  const { data, error } = useGetAuthConfig(authConfig);

  useEffect(() => {
    if (data) {
      setAuthConfig(data);
      setAuthConfigInLocalStorage(data);
    }
  }, [data]);

  if (error) return <ErrorComponent message="failed to load auth config" error={error} />;

  return <AuthConfigContext.Provider value={authConfig}>{children}</AuthConfigContext.Provider>;
};

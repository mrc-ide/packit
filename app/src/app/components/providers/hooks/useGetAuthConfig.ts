import useSWR from "swr";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";
import { AuthConfig } from "../types/AuthConfigTypes";

export const useGetAuthConfig = (authConfig: AuthConfig | null) => {
  const { data, error, isLoading } = useSWR<AuthConfig>(
    !authConfig ? `${appConfig.apiUrl()}/auth/config` : null,
    (url: string) => fetcher({ url }),
    { revalidateOnFocus: false }
  );

  return {
    data,
    isLoading,
    error
  };
};

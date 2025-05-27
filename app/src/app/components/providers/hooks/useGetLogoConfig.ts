import useSWR from "swr";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";
import { LogoConfiguration } from "../../../../types";

export const useGetLogoConfig = () => {
  const { data, isLoading, error } = useSWR<LogoConfiguration>(`${appConfig.apiUrl()}/logo/config`, (url: string) =>
    fetcher({ url, noAuth: true })
  );

  return {
    logoConfig: data,
    isLoading,
    error
  };
};

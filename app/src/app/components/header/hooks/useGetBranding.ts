import useSWR from "swr";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";
import { BrandingConfiguration } from "../../../../types";

export const useGetBranding = () => {
  const { data, isLoading, error } = useSWR<BrandingConfiguration>(
    `${appConfig.apiUrl()}/configuration/branding`,
    (url: string) => fetcher({ url, noAuth: true })
  );

  console.log(data, isLoading, error);

  return {
    brandConfig: data,
    isLoading,
    error
  };
};

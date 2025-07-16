import useSWR from "swr";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";
import { BrandingConfiguration } from "@/types";

export const useGetBrandingConfig = () => {
  const { data, isLoading, error } = useSWR<BrandingConfiguration>(
    `${appConfig.apiUrl()}/branding/config`,
    (url: string) => fetcher({ url, noAuth: true }),
    { revalidateOnFocus: false }
  );

  return {
    brandingConfig: data,
    isLoading,
    error
  };
};

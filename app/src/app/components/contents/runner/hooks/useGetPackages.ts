import useSWR from "swr";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";
import { RunnerPackage } from "@/types";

export const useGetPackages = () => {
  const { data, isLoading, error, mutate } = useSWR<RunnerPackage[]>(
    `${appConfig.apiUrl()}/runner/packages`,
    (url: string) => fetcher({ url })
  );

  return {
    packages: data,
    isLoading,
    error,
    mutate
  };
};

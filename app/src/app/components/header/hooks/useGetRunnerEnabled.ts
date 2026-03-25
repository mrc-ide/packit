import useSWR from "swr";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";

export const useGetRunnerEnabled = (shouldFetch = true) => {
  const { data, error, isLoading } = useSWR<boolean>(
    shouldFetch ? `${appConfig.apiUrl()}/runner/enabled` : null,
    (url: string) => fetcher({ url }),
    {
      revalidateOnFocus: false
    }
  );

  return {
    isRunnerEnabled: data === true,
    isLoading,
    error
  };
};

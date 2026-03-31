import useSWR from "swr";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";

export const useGetRunnerEnabled = (runnerEnabled: boolean | null) => {
  const { data, error, isLoading } = useSWR<boolean>(
    runnerEnabled === null ? `${appConfig.apiUrl()}/runner/enabled` : null,
    (url: string) => fetcher({ url, noAuth: true }),
    { revalidateOnFocus: false }
  );

  return {
    isRunnerEnabled: data,
    isLoading,
    error
  };
};

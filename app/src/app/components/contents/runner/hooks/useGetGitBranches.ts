import useSWR from "swr";
import { GitBranches } from "../types/GitBranches";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";

export const useGetGitBranches = () => {
  const { data, isLoading, error, mutate } = useSWR<GitBranches>(
    `${appConfig.apiUrl()}/runner/git/branches`,
    (url: string) => fetcher({ url })
  );

  return {
    branchData: data,
    isLoading,
    error,
    mutate
  };
};

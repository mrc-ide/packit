import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { RunInfo } from "../types/RunInfo";

export const useGetTaskRunLogs = (taskId: string | undefined) => {
  const { data, error, isLoading } = useSWR<RunInfo>(`${appConfig.apiUrl()}/runner/status/${taskId}`, (url: string) =>
    fetcher({ url })
  );

  return { runInfo: data, error, isLoading };
};

import useSWR from "swr";
import { PageableBasicRunInfo } from "../types/RunInfo";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";

export const useGetTasksRunLogs = (pageNumber: number, pageSize: number, filterPacketGroupName: string) => {
  const { data, isLoading, error, mutate } = useSWR<PageableBasicRunInfo>(
    `${appConfig.apiUrl()}/runner/list/status?pageNumber=${pageNumber}&pageSize=${pageSize}\
    &filterPacketGroupName=${filterPacketGroupName}`,
    (url: string) => fetcher({ url })
  );

  return {
    runInfo: data,
    isLoading,
    error,
    mutate
  };
};

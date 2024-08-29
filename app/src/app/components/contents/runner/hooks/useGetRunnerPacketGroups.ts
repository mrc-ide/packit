import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { RunnerPacketGroup } from "../types/RunnerPacketGroup";

export const useGetRunnerPacketGroups = (branchName: string) => {
  const { data, isLoading, error } = useSWR<RunnerPacketGroup[]>(
    `${appConfig.apiUrl()}/runner/packetGroups?ref=${branchName}`,
    (url: string) => fetcher({ url })
  );

  return { packetGroups: data, isLoading, error };
};

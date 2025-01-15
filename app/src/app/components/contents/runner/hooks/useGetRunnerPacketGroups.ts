import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { RunnerPacketGroup } from "../types/RunnerPacketGroup";

export const useGetRunnerPacketGroups = (branchCommit: string | null) => {
  const { data, isLoading, error } = useSWR<RunnerPacketGroup[]>(
    branchCommit !== null ? `${appConfig.apiUrl()}/runner/packetGroups?ref=${branchCommit}` : null,
    (url: string) => fetcher({ url })
  );

  return { packetGroups: data, isLoading, error };
};

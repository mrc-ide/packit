import useSWR from "swr";
import { Parameter } from "../types/RunnerPacketGroup";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";

export const useGetParameters = (packetGroupName: string, branchCommit: string) => {
  const { data, isLoading, error } = useSWR<Parameter[]>(
    packetGroupName ? `${appConfig.apiUrl()}/runner/${packetGroupName}/parameters?ref=${branchCommit}` : null,
    (url: string) => fetcher({ url })
  );

  return { parameters: data, isLoading, error };
};

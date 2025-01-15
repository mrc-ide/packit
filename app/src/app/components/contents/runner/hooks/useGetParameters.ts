import useSWR from "swr";
import { Parameter } from "../types/RunnerPacketGroup";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";

export const useGetParameters = (packetGroupName: string | null, branchCommit: string | null) => {
  const { data, isLoading, error } = useSWR<Parameter[]>(
    packetGroupName && branchCommit
      ? `${appConfig.apiUrl()}/runner/${packetGroupName}/parameters?ref=${branchCommit}`
      : null,
    (url: string) => fetcher({ url })
  );

  return { parameters: data, isLoading, error };
};

import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { Packet } from "../../../../../types";

export const useGetPacketDependencies = (packetId: string | undefined) => {
  const { data, isLoading, error } = useSWR<Packet[]>(
    packetId ? `${appConfig.apiUrl()}/packets/${packetId}/dependencies` : null,
    (url: string) => fetcher({ url })
  );

  return {
    dependencies: data,
    isLoading,
    error
  };
};

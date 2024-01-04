import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PacketMetadata } from "../../../../../types";

export const useGetPacketById = (packetId: string | undefined) => {
  const { data, isLoading, error } = useSWR<PacketMetadata>(
    `${appConfig.apiUrl()}/packets/metadata/${packetId}`,
    (url: string) => fetcher({ url })
  );

  return {
    packet: data,
    isLoading,
    error
  };
};

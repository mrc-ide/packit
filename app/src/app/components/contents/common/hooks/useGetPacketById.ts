import useSWR from "swr";
import { PacketMetadata } from "../../../../../types";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";

export const useGetPacketById = (packetId: string | undefined) => {
  const { data, isLoading, error } = useSWR<PacketMetadata>(
    `${appConfig.apiUrl()}/packets/metadata/${packetId}`,
    (url: string) => fetcher({ url, authRequired: true })
  );

  return {
    packet: data,
    isLoading,
    error
  };
};

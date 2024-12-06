import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PacketMetadata } from "../../../../../types";

export const useGetPacketById = (packetId: string | undefined) => {
  const { data, isLoading, error } = useSWR<PacketMetadata>(
    packetId ?
      `${appConfig.apiUrl()}/packets/metadata/${packetId}` : null,
    (url: string) => fetcher({ url })
  );

  const packet = { ...data, displayName: data?.custom?.orderly?.description?.display };

  return {
    packet,
    isLoading,
    error
  };
};

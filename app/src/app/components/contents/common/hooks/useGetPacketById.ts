import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PacketMetadata } from "../../../../../types";

export const useGetPacketById = (packetId: string | undefined) => {
  const { data, isLoading, error } = useSWR<PacketMetadata>(
    packetId ? `${appConfig.apiUrl()}/packets/${packetId}` : null,
    (url: string) => fetcher({ url })
  );

  const displayName = data?.custom?.orderly.description.display;
  const packet = displayName ? { ...data, displayName } : data;

  return {
    packet,
    isLoading,
    error
  };
};

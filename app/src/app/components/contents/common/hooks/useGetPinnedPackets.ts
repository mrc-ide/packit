import useSWR from "swr";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";
import { PacketMetadata } from "@/types";

export const useGetPinnedPackets = () => {
  const { data, isLoading, error, mutate } = useSWR<PacketMetadata[]>(
    `${appConfig.apiUrl()}/pins/packets`,
    (url: string) => fetcher({ url })
  );

  const packets = data?.map((packet) => {
    const displayName = packet.custom?.orderly.description.display;
    return displayName ? { ...packet, displayName } : packet;
  });

  return {
    packets,
    isLoading,
    error,
    mutate
  };
};

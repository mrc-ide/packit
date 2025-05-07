import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PacketMetadata } from "../../../../../types";
import { PacketNameError } from "../../../../../lib/errors";

export const useGetPacketById = (packetId: string | undefined, packetName: string | undefined) => {
  const { data, isLoading, error } = useSWR<PacketMetadata>(
    packetId ? `${appConfig.apiUrl()}/packets/${packetId}` : null,
    (url: string) => fetcher({ url })
  );

  if (data?.name && data?.name !== packetName) {
    throw new PacketNameError();
  }

  const displayName = data?.custom?.orderly?.description?.display;

  const packet = displayName ? { ...data, displayName } : data;

  return {
    packet,
    isLoading,
    error
  };
};

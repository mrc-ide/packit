import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PacketGroupDisplay } from "../../../../../types";

export const useGetPacketGroupDisplay = (packetName: string) => {
  const { data, isLoading, error } = useSWR<PacketGroupDisplay>(
    `${appConfig.apiUrl()}/packetGroups/${packetName}/display`,
    (url: string) => fetcher({ url })
  );

  return {
    packetGroup: data,
    isLoading,
    error
  };
};

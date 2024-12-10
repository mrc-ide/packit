import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PacketGroupLatestIdAndDisplayName } from "../../../../../types";

export const useGetPacketGroupLatestIdAndDisplayName = (packetName: string) => {
  const { data, isLoading, error } = useSWR<PacketGroupLatestIdAndDisplayName>(
    `${appConfig.apiUrl()}/packetGroups/${packetName}/latestIdAndDisplayName`,
    (url: string) => fetcher({ url })
  );

  return {
    packetGroup: data,
    isLoading,
    error
  };
};

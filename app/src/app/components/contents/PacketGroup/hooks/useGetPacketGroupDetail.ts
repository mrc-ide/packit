import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PacketGroupDetail } from "../../../../../types";

export const useGetPacketGroupDetail = (packetName: string) => {
  const { data, isLoading, error } = useSWR<PacketGroupDetail>(
    `${appConfig.apiUrl()}/packetGroups/${packetName}/detail`,
    (url: string) => fetcher({ url })
  );

  return {
    packetGroup: data,
    isLoading,
    error
  };
};

import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { Packet } from "../../../../../types";

export const useGetPacketPage = (packetName: string | undefined) => {
  const url = `${appConfig.apiUrl()}/packets/${packetName}`;

  const { data, isLoading, error } = useSWR<Packet[]>(packetName ? url : null, (url: string) => fetcher({ url }));

  return {
    packets: data,
    isLoading,
    error
  };
};

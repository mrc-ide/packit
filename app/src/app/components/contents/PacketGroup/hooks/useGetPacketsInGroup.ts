import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { Packet } from "../../../../../types";

export const useGetPacketsInGroup = (packetName: string | undefined) => {
  const url = `${appConfig.apiUrl()}/packetGroup/${packetName}`;

  const { data, isLoading, error } = useSWR<Packet[]>(packetName ? url : null, (url: string) => fetcher({ url }));

  return {
    packets: data,
    isLoading,
    error
  };
};

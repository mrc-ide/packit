import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PageablePackets } from "../../../../../types";

export const useGetPacketPages = (packetGroupName: string | undefined, pageNumber: number, pageSize: number) => {
  const url = `${appConfig.apiUrl()}/packets/${packetGroupName}?pageNumber=${pageNumber}&pageSize=${pageSize}`

  const { data, isLoading, error } = useSWR<PageablePackets>(
    packetGroupName ? url : null,
    (url: string) => fetcher({ url })
  );

  return {
    packetPages: data,
    isLoading,
    error
  };
};

import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PageablePackets } from "../../../../../types";

export const useGetPacketPage = (packetName: string | undefined, pageNumber: number, pageSize: number) => {
  const url = `${appConfig.apiUrl()}/packets/${packetName}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const { data, isLoading, error } = useSWR<PageablePackets>(
    packetName ? url : null,
    (url: string) => fetcher({ url })
  );

  return {
    packetPage: data,
    isLoading,
    error
  };
};

import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PageablePackets } from "../../../../../types";

export const useGetPacketGroups = (packetName: string | undefined, pageNumber: number, pageSize: number) => {
  const { data, isLoading, error } = useSWR<PageablePackets>(
    `${appConfig.apiUrl()}/packets/${packetName}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    (url: string) => fetcher({ url })
  );

  return {
    packetGroups: data,
    isLoading,
    error
  };
};

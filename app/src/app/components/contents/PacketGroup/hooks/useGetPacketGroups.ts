import useSWR from "swr";
import { PageablePackets } from "../../../../../types";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";

export const useGetPacketGroups = (packetName: string | undefined, pageNumber: number, pageSize: number) => {
  const { data, isLoading, error } = useSWR<PageablePackets>(
    `${appConfig.apiUrl()}/packets/${packetName}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    (url: string) => fetcher({ url, authRequired: true })
  );

  return {
    packetGroups: data,
    isLoading,
    error
  };
};

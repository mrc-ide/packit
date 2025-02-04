import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PageablePacketGroupSummaries } from "../../../../../types";

export const useGetPacketGroupSummaries = (pageNumber: number, pageSize: number, filter: string) => {
  const { data, isLoading, error } = useSWR<PageablePacketGroupSummaries>(
    `${appConfig.apiUrl()}/packetGroupSummaries?pageNumber=${pageNumber}&pageSize=${pageSize}` + `&filter=${filter}`,
    (url: string) => fetcher({ url })
  );

  return {
    packetGroupSummaries: data,
    isLoading,
    error
  };
};

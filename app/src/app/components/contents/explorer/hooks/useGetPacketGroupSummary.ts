import useSWR from "swr";
import { PageablePacketGroupSummary } from "../../../../../types";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";

export const useGetPacketGroupSummary = (pageNumber: number, pageSize: number, filterByName: string) => {
  const { data, isLoading, error } = useSWR<PageablePacketGroupSummary>(
    `${appConfig.apiUrl()}/packets/packetGroupSummary?pageNumber=${pageNumber}&pageSize=${pageSize}\
        &filterName=${filterByName}`,
    (url: string) => fetcher({ url, authRequired: true })
  );

  return {
    packetGroupSummary: data,
    isLoading,
    error
  };
};

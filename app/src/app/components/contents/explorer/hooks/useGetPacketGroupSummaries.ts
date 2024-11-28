import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PageablePacketGroupSummary } from "../../../../../types";

export const useGetPacketGroupSummaries = (pageNumber: number, pageSize: number, filterByName: string) => {
  const { data, isLoading, error } = useSWR<PageablePacketGroupSummary>(
    `${appConfig.apiUrl()}/packets/packetGroupSummaries?pageNumber=${pageNumber}&pageSize=${pageSize}`
      + `&filterName=${filterByName}`,
    (url: string) => fetcher({ url })
  );

  return {
    packetGroupSummaries: data,
    isLoading,
    error
  };
};

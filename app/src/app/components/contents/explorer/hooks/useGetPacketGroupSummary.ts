import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PageablePacketGroupSummary } from "../../../../../types";
import { ApiError } from "../../../../../lib/errors";

export const useGetPacketGroupSummary = (pageNumber: number, pageSize: number, filterByName: string) => {
  const { data, isLoading, error } = useSWR<PageablePacketGroupSummary>(
    `${appConfig.apiUrl()}/packets/packetGroupSummary?pageNumber=${pageNumber}&pageSize=${pageSize}\
        &filterName=${filterByName}`,
    (url: string) => fetcher({ url })
  );

  return {
    packetGroupSummary: data,
    isLoading,
    error
  };
};

import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { PageablePacketGroupDisplays } from "../../../../../types";

export const useGetPacketGroupDisplays = (pageNumber: number, pageSize: number, filter: string) => {
  const { data, isLoading, error } = useSWR<PageablePacketGroupDisplays>(
    `${appConfig.apiUrl()}/packets/packetGroupSummaries?pageNumber=${pageNumber}&pageSize=${pageSize}`
    + `&filter=${filter}`,
    (url: string) => fetcher({ url })
  );

  return {
    packetGroupDisplays: data,
    isLoading,
    error
  };
};

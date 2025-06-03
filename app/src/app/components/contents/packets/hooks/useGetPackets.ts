import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { Packet } from "../../../../../types";

export const useGetPackets = (packetIds: string[]) => {
  const { data, isLoading, error } = useSWR<Packet[]>(`${appConfig.apiUrl()}/packets`, (url: string) =>
    fetcher({ url, body: packetIds, method: "POST" })
  );

  return {
    packets: data,
    isLoading,
    error
  };
};

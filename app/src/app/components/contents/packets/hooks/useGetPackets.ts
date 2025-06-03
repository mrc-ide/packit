import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { Packet } from "../../../../../types";

export const useGetPackets = (packetIds: string[]) => {
  // By default, useSWR reuses the 'key' parameter as the URL, (temporarily) cacheing requests to the same URL.
  // Here, we use a non-URL key (and explicitly pass our URL to fetcher) in order to prevent useSWR cacheing
  // requests for different packets, which have the same URL since the packet ids are sent in the request body.
  const key = packetIds.join();
  const { data, isLoading, error } = useSWR<Packet[]>(key, () =>
    fetcher({ url: `${appConfig.apiUrl()}/packets`, body: packetIds, method: "POST" })
  );

  return {
    packets: data,
    isLoading,
    error
  };
};

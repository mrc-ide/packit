import useSWR from "swr";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";

export const useGetRunTaskIdByPacketId = (packetId: string | undefined) => {
  const { data, isLoading, error } = useSWR<{ runTaskId: string }>(
    packetId ? `${appConfig.apiUrl()}/runner/packet/${packetId}/task` : null,
    (url: string) => fetcher({ url }),
    { revalidateOnFocus: false }
  );

  return {
    runTaskId: data?.runTaskId,
    isLoading,
    error
  };
};

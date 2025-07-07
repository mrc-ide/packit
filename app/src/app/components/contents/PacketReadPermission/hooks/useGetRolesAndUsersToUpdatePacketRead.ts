import useSWR from "swr";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";
import { RolesAndUsersToUpdateRead } from "../../admin/types/RoleWithRelationships";

export const useGetRolesAndUsersToUpdatePacketRead = (packetId = "") => {
  const { data, isLoading, error, mutate } = useSWR<RolesAndUsersToUpdateRead>(
    `${appConfig.apiUrl()}/packets/${packetId}/read-permission`,
    (url: string) => fetcher({ url })
  );

  return {
    rolesAndUsers: data,
    isLoading,
    error,
    mutate
  };
};

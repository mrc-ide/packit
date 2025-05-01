import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { RolesAndUsersToUpdatePacketRead } from "../../manageAccess/types/RoleWithRelationships";

export const useGetRolesAndUsersToUpdatePacketRead = (packetId = "") => {
  const { data, isLoading, error, mutate } = useSWR<RolesAndUsersToUpdatePacketRead>(
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

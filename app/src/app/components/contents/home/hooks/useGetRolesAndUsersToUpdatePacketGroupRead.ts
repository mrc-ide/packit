import useSWR from "swr";
import { RolesAndUsersToUpdateRead } from "../../manageAccess/types/RoleWithRelationships";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";
import { hasAnyPacketManagePermission } from "../../../../../lib/auth/hasPermission";

// Format of return data is: Record<packetGroupName string, rolesAndUsersToUpdateRead>
export const useGetRolesAndUsersToUpdatePacketGroupRead = (authorities: string[] = []) => {
  const { data, isLoading, error, mutate } = useSWR<Record<string, RolesAndUsersToUpdateRead>>(
    hasAnyPacketManagePermission(authorities) ? `${appConfig.apiUrl()}/packetGroups/read-permission` : null,
    (url: string) => fetcher({ url })
  );

  return {
    rolesAndUsers: data,
    isLoading,
    error,
    mutate
  };
};

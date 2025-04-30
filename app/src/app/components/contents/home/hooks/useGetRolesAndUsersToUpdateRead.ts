import useSWR from "swr";
import { RolesAndUsersToUpdateRead } from "../../manageAccess/types/RoleWithRelationships";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";

// <packetGroupName string, rolesAndUsersToUpdateRead>

export const useGetRolesAndUsersToUpdateRead = () => {
  const { data, isLoading, error, mutate } = useSWR<Record<string, RolesAndUsersToUpdateRead>>(
    `${appConfig.apiUrl()}/packetGroups/read-permission`,
    (url: string) => fetcher({ url })
  );

  return {
    rolesAndUsers: data,
    isLoading,
    error,
    mutate
  };
};

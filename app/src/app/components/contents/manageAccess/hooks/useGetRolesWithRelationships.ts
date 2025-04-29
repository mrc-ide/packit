import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { RolesAndUsersWithPermissions } from "../types/RoleWithRelationships";

export const useGetRolesWithRelationships = () => {
  const { data, isLoading, error, mutate } = useSWR<RolesAndUsersWithPermissions>(
    `${appConfig.apiUrl()}/user-role`,
    (url: string) => fetcher({ url })
  );

  return {
    roles: data ? data.roles : [],
    users: data ? data.users : [],
    isLoading,
    error,
    mutate
  };
};

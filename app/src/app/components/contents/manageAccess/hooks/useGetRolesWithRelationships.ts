import useSWR from "swr";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";

export const useGetRolesWithRelationships = () => {
  const { data, isLoading, error } = useSWR<RoleWithRelationships[]>(
    `${appConfig.apiUrl()}/role?isUsername=false`,
    (url: string) => fetcher({ url })
  );

  return {
    roles: data,
    isLoading,
    error
  };
};

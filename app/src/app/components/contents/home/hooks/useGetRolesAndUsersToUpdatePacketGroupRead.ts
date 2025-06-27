import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { RolesAndUsersToUpdateRead } from "../../admin/types/RoleWithRelationships";

/**
 * Key of return type is packet group name
 * Only returns packet group names that user has permissions to manage
 */
export const useGetRolesAndUsersToUpdatePacketGroupRead = () => {
  const { data, isLoading, error, mutate } = useSWR<Record<string, RolesAndUsersToUpdateRead>>(
    `${appConfig.apiUrl()}/packetGroups/_/read-permission`,
    (url: string) => fetcher({ url }),
    {
      revalidateOnFocus: false
    }
  );

  return {
    rolesAndUsers: data,
    isLoading,
    error,
    mutate
  };
};

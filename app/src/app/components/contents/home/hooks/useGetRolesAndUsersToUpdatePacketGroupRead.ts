import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { RolesAndUsersToUpdateRead } from "../../admin/types/RoleWithRelationships";

export const useGetRolesAndUsersToUpdatePacketGroupRead = (packetGroupName: string) => {
  const { data, isLoading, error, mutate } = useSWR<RolesAndUsersToUpdateRead>(
    `${appConfig.apiUrl()}/packetGroups/${packetGroupName}/read-permission`,
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

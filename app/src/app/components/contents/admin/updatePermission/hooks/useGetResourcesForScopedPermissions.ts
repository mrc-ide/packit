import useSWR from "swr";
import appConfig from "@config/appConfig";
import { PermissionScope } from "@lib/constants";
import { PageableBasicDto } from "@/types";
import { fetcher } from "@lib/fetch";
import { getPermissionScopePaths } from "../utils/getPermissionScopePaths";

export const useGetResourcesForScopedPermissions = (scope: PermissionScope, filterName: string) => {
  const scopePath = getPermissionScopePaths(filterName)[scope];
  const { data, isLoading, error } = useSWR<PageableBasicDto>(
    scopePath ? `${appConfig.apiUrl()}/${scopePath}` : null,
    (url: string) => fetcher({ url })
  );

  return { data, isLoading, error };
};

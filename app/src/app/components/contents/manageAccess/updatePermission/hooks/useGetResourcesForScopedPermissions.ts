import useSWR from "swr";
import appConfig from "../../../../../../config/appConfig";
import { PermissionScope } from "../../../../../../lib/constants";
import { PageableBasicDto } from "../../../../../../types";
import { fetcher } from "../../../../../../lib/fetch";

const scopeToPathVariable = {
  global: null,
  packet: "packets",
  tag: "tag",
  packetGroup: "packetGroup"
};

export const useGetResourcesForScopedPermissions = (scope: PermissionScope, filterName: string) => {
  const scopePathVariable = scopeToPathVariable[scope];
  const { data, isLoading, error } = useSWR<PageableBasicDto>(
    scopePathVariable ? `${appConfig.apiUrl()}/${scopePathVariable}?filterName=${filterName}&pageSize=150` : null,
    (url: string) => fetcher({ url })
  );

  return { data, isLoading, error };
};

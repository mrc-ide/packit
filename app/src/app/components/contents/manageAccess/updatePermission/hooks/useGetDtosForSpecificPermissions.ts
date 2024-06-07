import useSWR from "swr";
import appConfig from "../../../../../../config/appConfig";
import { PermissionScope } from "../../../../../../lib/constants";
import { PageableBasicDto } from "../../../../../../types";
import { fetcher } from "../../../../../../lib/fetch";

export const useGetDtosForScopedPermissions = (scope: PermissionScope, filterName: string) => {
  const scopePathVariable = scope === "tag" ? "tag" : `packets${scope === "packetGroup" ? "/packetGroup" : ""}`;
  const { data, isLoading, error } = useSWR<PageableBasicDto>(
    scope !== "global" ? `${appConfig.apiUrl()}/${scopePathVariable}?filterName=${filterName}` : null,
    (url: string) => fetcher({ url })
  );

  return { data, isLoading, error };
};

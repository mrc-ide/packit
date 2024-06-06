import useSWR from "swr";
import appConfig from "../../../../../../config/appConfig";
import { PermissionScope } from "../../../../../../lib/constants";
import { PageableBasicDto } from "../../../../../../types";
import { fetcher } from "../../../../../../lib/fetch";

export const useGetDtosForScopedPermissions = (scope: PermissionScope, filterName: string) => {
  const searchParam = scope === "tag" ? "tag" : `packets${scope === "packet" ? "" : `/${scope}`}`;
  const { data, isLoading, error } = useSWR<PageableBasicDto>(
    scope !== "global" ? `${appConfig.apiUrl()}/${searchParam}?filterName=${filterName}` : null,
    (url: string) => fetcher({ url })
  );

  return { data, isLoading, error };
};

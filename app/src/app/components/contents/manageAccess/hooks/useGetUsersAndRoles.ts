import useSWR from "swr";
import { Role } from "../types/Role";
import { User } from "../types/User";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";

type Data = { roles: Role[], users: User[] };
type Key = { roleUrl: string, userUrl: string };

export const useGetUsersAndRoles = () => {
  const { data, isLoading, error, mutate } = useSWR<Data, any, Key>(
    { userUrl: `${appConfig.apiUrl()}/user`,
      roleUrl: `${appConfig.apiUrl()}/role` },
    async ({ roleUrl, userUrl } : Key) => {
      const [ users, roles ] = await Promise.all([
        fetcher({ url: userUrl }),
        fetcher({ url: roleUrl })
      ]);
      return { users, roles };
    }
  );

  return {
    users: data ? data.users : [],
    roles: data ? data.roles : [],
    isLoading,
    error,
    mutate
  };
};

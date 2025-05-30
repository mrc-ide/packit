import useSWR from "swr";
import { UserState } from "../types/UserTypes";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";

export const useGetUserAuthorities = (userState: UserState | null) => {
  const { data, error } = useSWR<string[]>(
    userState ? `${appConfig.apiUrl()}/user/me/authorities` : null,
    (url: string) => fetcher({ url }),
    { revalidateOnFocus: false }
  );

  return {
    authorities: data,
    error
  };
};

import useSWR from "swr";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";
import { LogoConfiguration } from "../../../../types";

export const useGetLogoConfig = () => {
  const { data, isLoading, error } = useSWR<LogoConfiguration>(
    `${appConfig.apiUrl()}/configuration/logo`,
    (url: string) => fetcher({ url, noAuth: true })
  );

  if (data) {
    data.filename = "exampleVIMCLogo.png"
    console.log('added filename');
  } else {
    console.log('no file name');
  }

  console.log(data?.filename);


  return {
    logoConfig: data,
    isLoading,
    error
  };
};

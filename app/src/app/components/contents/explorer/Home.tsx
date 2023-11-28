import { useState } from "react";
import useSWR from "swr";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";
import { PageablePacketIdCountsDTO } from "../../../../types";

const groupBy = (xs: any[] | undefined, key: string) => {
  return xs?.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

export const Home = () => {
  const [pageNumber, setPageNumber] = useState(0);
  const [filterByName, setFilterByName] = useState("");

  const { data, isLoading, error } = useSWR<PageablePacketIdCountsDTO>(
    `${appConfig.apiUrl()}/packets/overview?pageNumber=${pageNumber}&pageSize=10&filterName=${filterByName}`,
    (url: string) => fetcher({ url, authRequired: true })
  );

  console.log(data);

  if (error) return <div className="text-red-500">failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div>
      Home
      <div>
        {data?.content?.map((packet, i) => (
          <div key={i}>
            name: {packet.name} - latestid: {packet.latestId} - count: {packet.count} - latesttime: {packet.latestTime}
          </div>
        ))}
      </div>
    </div>
  );
};

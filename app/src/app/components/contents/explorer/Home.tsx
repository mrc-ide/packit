import { useState } from "react";
import useSWR from "swr";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";
import { PageablePacketIdCountsDTO } from "../../../../types";

export const Home = () => {
  const [pageNumber] = useState(0);
  const [filterByName] = useState("");

  const { data, isLoading, error } = useSWR<PageablePacketIdCountsDTO>(
    `${appConfig.apiUrl()}/packets/packetGroupSummary?pageNumber=${pageNumber}&pageSize=10&filterName=${filterByName}`,
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
            name: {packet.name} - latestid: {packet.latestId} - count: {packet.nameCount} - latesttime:{" "}
            {packet.latestTime}
          </div>
        ))}
      </div>
    </div>
  );
};

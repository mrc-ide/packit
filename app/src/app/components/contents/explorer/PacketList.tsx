import { useState } from "react";
import useSWR from "swr";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";
import { PageablePacketIdCountsDTO } from "../../../../types";
import { PacketListItem } from "./PacketListItem";
import { PacketListPagination } from "./PacketListPagination";

interface PacketListProps {
  filterByName: string;
}
export const PacketList = ({ filterByName }: PacketListProps) => {
  const [pageNumber, setPageNumber] = useState(0);
  const pageSize = 2;
  const { data, isLoading, error } = useSWR<PageablePacketIdCountsDTO>(
    `${appConfig.apiUrl()}/packets/overview?pageNumber=${pageNumber}&pageSize=${pageSize}&filterName=${filterByName}`,
    (url: string) => fetcher({ url, authRequired: true })
  );

  if (error) return <div className="text-red-500">failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <>
      <ul className="flex flex-col border rounded-md">
        {/* split into own component */}
        {data?.content?.map((packet) => <PacketListItem key={packet.latestId} packet={packet} />)}
      </ul>
      {data && <PacketListPagination pageNumber={pageNumber} data={data} setPageNumber={setPageNumber} />}
    </>
  );
};

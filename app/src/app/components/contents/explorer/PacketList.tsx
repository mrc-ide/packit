import { Dispatch, SetStateAction } from "react";
import useSWR from "swr";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";
import { PageablePacketIdCountsDTO } from "../../../../types";
import { Skeleton } from "../../Base/Skeleton";
import { Pagination } from "../common/Pagination";
import { PacketListItem } from "./PacketListItem";

interface PacketListProps {
  filterByName: string;
  pageNumber: number;
  pageSize: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
}
export const PacketList = ({ filterByName, pageNumber, pageSize, setPageNumber }: PacketListProps) => {
  const { data, isLoading, error } = useSWR<PageablePacketIdCountsDTO>(
    `${appConfig.apiUrl()}/packets/overview?pageNumber=${pageNumber}&pageSize=${pageSize}&filterName=${filterByName}`,
    (url: string) => fetcher({ url, authRequired: true })
  );

  if (error)
    return (
      <div className="flex border rounded-md p-6 justify-center text-red-500 flex-col items-center">
        <h3 className="scroll-m-20 text-lg font-semibold tracking-tight">Error fetching reports</h3>
        <p className="italic">Please try again later. If the problem persists, contact RSE team.</p>
      </div>
    );

  if (isLoading)
    return (
      <ul className="flex flex-col border rounded-md">
        {[...Array(8)].map((val, index) => (
          <li key={index} className="p-4 flex flex-col border-b space-y-1">
            <Skeleton className="h-6 w-64" />
            <div className="flex space-x-3 items-center">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      {data?.content?.length === 0 ? (
        <div className="flex border rounded-md p-6 justify-center text-muted-foreground">No reports found</div>
      ) : (
        <ul className="flex flex-col border rounded-md">
          {data?.content?.map((packet) => <PacketListItem key={packet.latestId} packet={packet} />)}
        </ul>
      )}

      {data && (
        <div className="flex items-center justify-center">
          <Pagination
            currentPageNumber={pageNumber}
            totalPages={data.totalPages}
            isFirstPage={data.first}
            isLastPage={data.last}
            setPageNumber={setPageNumber}
          />
        </div>
      )}
    </>
  );
};

import { Dispatch, SetStateAction } from "react";
import useSWR from "swr";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";
import { PageablePacketGroupSummary } from "../../../../types";
import { Skeleton } from "../../Base/Skeleton";
import { Pagination } from "../common/Pagination";
import { PacketGroupSummaryListItem } from "./PacketGroupSummaryListItem";
import { ErrorComponent } from "../common/ErrorComponent";

interface PacketGroupSummaryListProps {
  filterByName: string;
  pageNumber: number;
  pageSize: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
}
export const PacketGroupSummaryList = ({
  filterByName,
  pageNumber,
  pageSize,
  setPageNumber
}: PacketGroupSummaryListProps) => {
  const { data, isLoading, error } = useSWR<PageablePacketGroupSummary>(
    `${appConfig.apiUrl()}/packets/packetGroupSummary?pageNumber=${pageNumber}&pageSize=${pageSize}\
    &filterName=${filterByName}`,
    (url: string) => fetcher({ url })
  );

  if (error) return <ErrorComponent message="Error fetching packet groups" error={error} />;

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
          {data?.content?.map((packet) => <PacketGroupSummaryListItem key={packet.latestId} packet={packet} />)}
        </ul>
      )}

      {data?.content?.length ? (
        <div className="flex items-center justify-center">
          <Pagination
            currentPageNumber={pageNumber}
            totalPages={data.totalPages}
            isFirstPage={data.first}
            isLastPage={data.last}
            setPageNumber={setPageNumber}
          />
        </div>
      ) : null}
    </>
  );
};

import { Dispatch, SetStateAction } from "react";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { Skeleton } from "../../Base/Skeleton";
import { ErrorComponent } from "../common/ErrorComponent";
import { Pagination } from "../common/Pagination";
import { Unauthorized } from "../common/Unauthorized";
import { PacketGroupSummaryListItem } from "./PacketGroupSummaryListItem";
import { useGetPacketGroupSummary } from "./hooks/useGetPacketGroupSummary";

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
  const { packetGroupSummary, isLoading, error } = useGetPacketGroupSummary(pageNumber, pageSize, filterByName);

  if (error?.status === HttpStatus.Unauthorized) return <Unauthorized />;
  if (error) return <ErrorComponent message="Error fetching packet groups" error={error} />;

  if (isLoading)
    return (
      <ul className="flex flex-col border rounded-md">
        {[...Array(2)].map((_, index) => (
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
      {packetGroupSummary?.content?.length === 0 ? (
        <div className="flex border rounded-md p-6 justify-center text-muted-foreground">No reports found</div>
      ) : (
        <ul className="flex flex-col border rounded-md">
          {packetGroupSummary?.content?.map((packetGroup) => (
            <PacketGroupSummaryListItem key={packetGroup.latestId} packetGroup={packetGroup} />
          ))}
        </ul>
      )}

      {packetGroupSummary?.content.length ? (
        <div className="flex items-center justify-center">
          <Pagination
            currentPageNumber={pageNumber}
            totalPages={packetGroupSummary.totalPages}
            isFirstPage={packetGroupSummary.first}
            isLastPage={packetGroupSummary.last}
            setPageNumber={setPageNumber}
          />
        </div>
      ) : null}
    </>
  );
};

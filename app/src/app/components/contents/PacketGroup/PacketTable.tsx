import { useState } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "../../Base/Skeleton";
import { DataTable } from "../common/DataTable";
import { ErrorComponent } from "../common/ErrorComponent";
import { Pagination } from "../common/Pagination";
import { useGetPacketGroups } from "./hooks/useGetPacketGroups";
import { packetColumns } from "./packetColumns";

// TODO: make table more feature rich (sorting, filter, etc). May need to fetch all data then and let tanstack handle
export const PacketTable = () => {
  const { packetName } = useParams();
  const [pageNumber, setPageNumber] = useState(0);
  const PAGE_SIZE = 50;

  const { packetGroups, error, isLoading } = useGetPacketGroups(packetName, pageNumber, PAGE_SIZE);

  if (error) return <ErrorComponent message="Error fetching packets" error={error} />;

  if (isLoading)
    return (
      <ul className="flex flex-col border rounded-md">
        {[...Array(8)].map((_val, index) => (
          <li key={index} className="p-4 flex border-b space-y-1 justify-between">
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-2 w-48" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-64" />
          </li>
        ))}
      </ul>
    );

  return (
    <>
      {packetGroups && (
        <div className="space-y-4">
          <DataTable columns={packetColumns} data={packetGroups.content} />
          <div className="flex items-center justify-center">
            <Pagination
              currentPageNumber={pageNumber}
              totalPages={packetGroups.totalPages}
              isFirstPage={packetGroups.first}
              isLastPage={packetGroups.last}
              setPageNumber={setPageNumber}
            />
          </div>
        </div>
      )}
    </>
  );
};

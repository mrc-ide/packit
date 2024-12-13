import { useState } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "../../Base/Skeleton";
import { DataTable } from "../common/DataTable";
import { ErrorComponent } from "../common/ErrorComponent";
import { Pagination } from "../common/Pagination";
import { useGetPacketPage } from "./hooks/useGetPacketPage";
import { packetColumns } from "./packetColumns";
import { PAGE_SIZE } from "../../../../lib/constants";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { Unauthorized } from "../common/Unauthorized";

// TODO: make table more feature rich (sorting, filter, etc). May need to fetch all data then and let tanstack handle
export const PacketTable = ({ parentIsLoading }: { parentIsLoading: boolean }) => {
  const { packetName } = useParams();
  const [pageNumber, setPageNumber] = useState(0);
  const { packetPage, error, isLoading } = useGetPacketPage(packetName, pageNumber, PAGE_SIZE);

  if (error?.status === HttpStatus.Unauthorized) return <Unauthorized />;
  if (error) return <ErrorComponent message="Error fetching packets" error={error} />;

  if (isLoading || parentIsLoading)
    return (
      <ul className="flex flex-col border rounded-md">
        {[...Array(2)].map((_val, index) => (
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
      {packetPage && (
        <div className="space-y-4">
          <DataTable columns={packetColumns} data={packetPage.content} />
          <div className="flex items-center justify-center">
            <Pagination
              currentPageNumber={pageNumber}
              totalPages={packetPage.totalPages}
              isFirstPage={packetPage.first}
              isLastPage={packetPage.last}
              setPageNumber={setPageNumber}
            />
          </div>
        </div>
      )}
    </>
  );
};

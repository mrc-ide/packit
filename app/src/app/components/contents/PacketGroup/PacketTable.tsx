import { useParams } from "react-router-dom";
import appConfig from "../../../../config/appConfig";
import { fetcher } from "../../../../lib/fetch";
import { DataTable } from "../common/DataTable";
import { Pagination } from "../common/Pagination";
import { packetColumns } from "./packetColumns";
import { useState } from "react";
import useSWR from "swr";
import { PageablePackets } from "../../../../types";
import { ErrorComponent } from "../common/ErrorComponent";
import { Skeleton } from "../../Base/Skeleton";

// TODO: make table more feature rich (sorting, filter, hiding columns, etc.)
export const PacketTable = () => {
  const { packetName } = useParams();
  const [pageNumber, setPageNumber] = useState(0);
  const PAGE_SIZE = 50;

  const { data, isLoading, error } = useSWR<PageablePackets>(
    `${appConfig.apiUrl()}/packets/${packetName}?pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}`,
    (url: string) => fetcher({ url, authRequired: true })
  );

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
      {data && (
        <div className="space-y-4">
          <DataTable columns={packetColumns} data={data.content} />
          <div className="flex items-center justify-center">
            <Pagination
              currentPageNumber={pageNumber}
              totalPages={data.totalPages}
              isFirstPage={data.first}
              isLastPage={data.last}
              setPageNumber={setPageNumber}
            />
          </div>
        </div>
      )}
    </>
  );
};

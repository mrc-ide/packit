import { Dispatch, SetStateAction } from "react";
import { Skeleton } from "../../../Base/Skeleton";
import { DataTable } from "../../common/DataTable";
import { ErrorComponent } from "../../common/ErrorComponent";
import { Pagination } from "../../common/Pagination";
import { useGetTasksRunLogs } from "../hooks/useGetTasksRunLogs";
import { runInfoColumns } from "./runInfoColumns";

interface TasksLogsListProps {
  pageNumber: number;
  pageSize: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
  filterPacketGroupName: string;
}
export const TasksLogsList = ({ pageNumber, pageSize, setPageNumber, filterPacketGroupName }: TasksLogsListProps) => {
  const { runInfo, error, isLoading } = useGetTasksRunLogs(pageNumber, pageSize, filterPacketGroupName);

  if (error && !runInfo) return <ErrorComponent message="Error fetching tasks logs" error={error} />;

  if (isLoading && !runInfo)
    return (
      <ul className="flex flex-col border rounded-md">
        {[...Array(2)].map((_val, index) => (
          <li key={index} className="p-4 flex border-b space-y-1 justify-between">
            <Skeleton className="h-8 sm:w-28 md:w-36" />
            <Skeleton className="h-8 sm:w-28 md:w-36" />
            <Skeleton className="h-8 sm:w-28 md:w-36" />
            <Skeleton className="h-8 sm:w-28 md:w-36" />
            <Skeleton className="h-8 sm:w-28 md:w-36" />
          </li>
        ))}
      </ul>
    );
  console.log(runInfo);

  return (
    <>
      {runInfo && (
        <div className="space-y-4">
          <DataTable columns={runInfoColumns} data={runInfo.content} />
          <div className="flex items-center justify-center">
            <Pagination
              currentPageNumber={pageNumber}
              totalPages={runInfo.totalPages}
              isFirstPage={runInfo.first}
              isLastPage={runInfo.last}
              setPageNumber={setPageNumber}
            />
          </div>
        </div>
      )}
    </>
  );
};

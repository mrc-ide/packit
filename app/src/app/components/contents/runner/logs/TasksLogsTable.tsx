import { Dispatch, SetStateAction } from "react";
import { Skeleton } from "../../../Base/Skeleton";
import { DataTable } from "../../common/DataTable";
import { ErrorComponent } from "../../common/ErrorComponent";
import { Pagination } from "../../common/Pagination";
import { useGetTasksRunLogs } from "../hooks/useGetTasksRunLogs";
import { usePollLogs } from "../hooks/usePollLogs";
import { runInfoColumns } from "./runInfoColumns";

interface TasksLogsTableProps {
  pageNumber: number;
  pageSize: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
  filterPacketGroupName: string;
}
export const TasksLogsTable = ({ pageNumber, pageSize, setPageNumber, filterPacketGroupName }: TasksLogsTableProps) => {
  const { runInfos, error, isLoading, mutate } = useGetTasksRunLogs(pageNumber, pageSize, filterPacketGroupName);
  usePollLogs(mutate, runInfos ? runInfos.content : [], 3000);

  if (error && !runInfos) return <ErrorComponent message="Error fetching tasks logs" error={error} />;

  if (isLoading && !runInfos)
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

  return (
    <>
      {runInfos && (
        <div className="space-y-4">
          <DataTable columns={runInfoColumns} data={runInfos.content} />
          <div className="flex items-center justify-center">
            <Pagination
              currentPageNumber={pageNumber}
              totalPages={runInfos.totalPages}
              isFirstPage={runInfos.first}
              isLastPage={runInfos.last}
              setPageNumber={setPageNumber}
            />
          </div>
        </div>
      )}
    </>
  );
};

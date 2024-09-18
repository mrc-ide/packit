import { useParams } from "react-router-dom";
import { ApiError } from "../../../../lib/errors";
import { Skeleton } from "../../Base/Skeleton";
import { ErrorComponent } from "../common/ErrorComponent";
import { useGetTaskRunLogs } from "./hooks/useGetTaskRunLogs";
import { TaskRunLogs } from "./logs/TaskRunLogs";
import { TaskRunSummary } from "./logs/TaskRunSummary";
import { useEffect, useRef } from "react";

export const PacketRunTaskLogs = () => {
  const { taskId } = useParams();
  const { runInfo, error, isLoading, mutate } = useGetTaskRunLogs(taskId);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (runInfo?.status === "PENDING" || runInfo?.status === "RUNNING") {
      intervalRef.current = setInterval(() => {
        mutate();
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mutate, runInfo?.status]);

  if (error && !runInfo) {
    if (error instanceof ApiError) {
      return <ErrorComponent error={error} message={error.message} />;
    }
    return <ErrorComponent error={error} message="Error fetching run information for task" />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <Skeleton className="h-56	 w-full" />
        <Skeleton className="h-[30rem] w-full" />
      </div>
    );
  }

  return runInfo ? (
    <div className="flex flex-col space-y-4">
      <TaskRunSummary runInfo={runInfo} />
      <TaskRunLogs logs={runInfo.logs} />
    </div>
  ) : null;
};

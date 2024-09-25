import { useParams } from "react-router-dom";
import { ApiError } from "../../../../lib/errors";
import { Skeleton } from "../../Base/Skeleton";
import { ErrorComponent } from "../common/ErrorComponent";
import { useGetTaskRunLogs } from "./hooks/useGetTaskRunLogs";
import { usePollLogs } from "./hooks/usePollLogs";
import { TaskRunLogs } from "./logs/TaskRunLogs";
import { TaskRunSummary } from "./logs/TaskRunSummary";

export const PacketRunTaskLogs = () => {
  const { taskId } = useParams();
  const { runInfo, error, isLoading, mutate } = useGetTaskRunLogs(taskId);
  usePollLogs(mutate, runInfo ? [runInfo] : []);

  if (error && !runInfo) {
    if (error instanceof ApiError) {
      return <ErrorComponent error={error} message={error.message} />;
    }
    return <ErrorComponent error={error} message="Error fetching run information for task" />;
  }

  if (isLoading && !runInfo) {
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

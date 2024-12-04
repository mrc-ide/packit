import { Separator } from "../../../Base/Separator";
import { RunInfo } from "../types/RunInfo";
import { getStatusDisplayByStatus } from "../utils/taskRunUtils";
import { TaskRunSummaryBottom } from "./TaskRunSummaryBottom";
import { TaskRunSummaryTop } from "./TaskRunSummaryTop";

interface TaskRunSummaryProps {
  runInfo: RunInfo;
}

export const TaskRunSummary = ({ runInfo }: TaskRunSummaryProps) => {
  const {
    borderColor,
    separatorColor,
    bgColor,
    icon: Icon,
    displayDuration,
    createdTime,
    startTime,
    finishTime
  } = getStatusDisplayByStatus(runInfo);

  return (
    <div className={`flex border rounded-md flex-col ${borderColor}`}>
      <TaskRunSummaryTop
        Icon={Icon}
        displayDuration={displayDuration}
        packetGroupName={runInfo.packetGroupName}
        taskId={runInfo.taskId}
        bgColor={bgColor}
      />
      <Separator className={separatorColor} />
      <TaskRunSummaryBottom runInfo={runInfo} createdTime={createdTime} startTime={startTime} finishTime={finishTime} />
    </div>
  );
};

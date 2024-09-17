import { Separator } from "../../../Base/Separator";
import { useTheme } from "../../../providers/ThemeProvider";
import { RunInfo } from "../types/RunInfo";
import { getStatusDisplay } from "../utils/taskRunUtils";
import { TaskRunSummaryBottom } from "./TaskRunSummaryBottom";
import { TaskRunSummaryTop } from "./TaskRunSummaryTop";

interface TaskRunSummaryProps {
  runInfo: RunInfo;
}

export const TaskRunSummary = ({ runInfo }: TaskRunSummaryProps) => {
  const { borderColor, separatorColor, icon: Icon, displayDuration, displayStartTimeStamp } = getStatusDisplay(runInfo);
  const { theme } = useTheme(); // may need to updated so theme is light or dark only
  console.log(theme);

  return (
    <div className={`flex border rounded-md flex-col ${borderColor}`}>
      <TaskRunSummaryTop
        Icon={Icon}
        displayDuration={displayDuration}
        packetGroupName={runInfo.packetGroupName}
        taskId={runInfo.taskId}
      />
      <Separator className={separatorColor} />
      <TaskRunSummaryBottom runInfo={runInfo} displayStartTimeStamp={displayStartTimeStamp} />
    </div>
  );
};

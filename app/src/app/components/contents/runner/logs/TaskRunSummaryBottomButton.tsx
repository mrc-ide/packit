import { CircleOff, Loader2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button, buttonVariants } from "../../../Base/Button";
import { useCancelTask } from "../hooks/useCancelTask";
import { RunInfo } from "../types/RunInfo";
import { isUnfinishedStatus } from "../utils/taskRunUtils";

interface TaskRunSummaryBottomButtonProps {
  runInfo: RunInfo;
}
export const TaskRunSummaryBottomButton = ({ runInfo }: TaskRunSummaryBottomButtonProps) => {
  const { cancelTask, cancelInitiated } = useCancelTask(runInfo.taskId);

  if (runInfo.packetId)
    return (
      <NavLink
        to={`/${runInfo.packetGroupName}/${runInfo.packetId}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        View Packet
      </NavLink>
    );

  if (isUnfinishedStatus(runInfo.status))
    return (
      <Button variant="destructive" size="sm" onClick={cancelTask} disabled={cancelInitiated}>
        {cancelInitiated ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CircleOff className="h-4 w-4 mr-1" />}
        <span>Cancel task</span>
      </Button>
    );

  return <div></div>;
};

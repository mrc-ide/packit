import { NavLink } from "react-router-dom";
import { RunInfo } from "../types/RunInfo";
import { Button, buttonVariants } from "../../../Base/Button";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";

interface TaskRunSummaryBottomButtonProps {
  runInfo: RunInfo;
}
export const TaskRunSummaryBottomButton = ({ runInfo }: TaskRunSummaryBottomButtonProps) => {
  const cancelTask = async () => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/runner/cancel/${runInfo.taskId}`,
        method: "POST"
      });
    } catch (error) {
      console.error("Error cancelling task:", error);
      // Handle error appropriately, e.g., show a notification or alert
    }
  };
  if (runInfo.packetId)
    return (
      <NavLink
        to={`/${runInfo.packetGroupName}/${runInfo.packetId}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        View Packet
      </NavLink>
    );

  // if (runInfo.status == "PENDING" || runInfo.status === "RUNNING" || runInfo.status === "DEFERRED") {
  return (
    <Button variant="destructive" size="sm" onClick={cancelTask}>
      Cancel Task
    </Button>
  );
  // }
  return <div></div>;
};

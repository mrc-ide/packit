import { CircleCheck, CircleEllipsis, CircleX, Clock5 } from "lucide-react";
import { cn } from "../../../../../lib/cn";
import { Separator } from "../../../Base/Separator";
import { useTheme } from "../../../providers/ThemeProvider";
import { RunInfo, Status } from "../types/RunInfo";

interface TaskRunSummaryProps {
  runInfo: RunInfo;
}
// update to be bg specific and theme specific. probably extract into helper function which returns needed specific
// eg bg-color, color, icon, times to show, etc..
const getStatusDisplay = (status: Status) => {
  switch (status) {
    case "PENDING":
      return {
        borderColor: "border-gray-400",
        separatorColor: "bg-gray-400",
        icon: () => <CircleEllipsis size={56} absoluteStrokeWidth={true} className="text-background fill-gray-400" />
      };
    case "RUNNING":
      return {
        borderColor: "border-yellow-400",
        separatorColor: "bg-yellow-400",
        icon: () => <Clock5 size={56} absoluteStrokeWidth={true} className="text-background fill-yellow-400" />
      };
    case "COMPLETE":
      return {
        borderColor: "border-green-400",
        separatorColor: "bg-green-400",
        icon: () => <CircleCheck size={56} absoluteStrokeWidth={true} className="text-background fill-green-400" />
      };
    default:
      // Error states
      return {
        borderColor: "border-red-400",
        separatorColor: "bg-red-400",
        icon: () => <CircleX size={56} absoluteStrokeWidth={true} className="text-background fill-red-400" />
      };
  }
};
// some sort of polling mechanism to update the status of the task
export const TaskRunSummary = ({ runInfo }: TaskRunSummaryProps) => {
  const { borderColor, separatorColor, icon: Icon } = getStatusDisplay(runInfo.status);
  const { theme } = useTheme(); // may need to updated so theme is light or dark only
  console.log(theme);

  return (
    <div className={`flex border rounded-md flex-col ${borderColor}`}>
      <div className="m-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="font-semibold text-xl tracking-tight">{runInfo.packetGroupName}</h3>
          <div className="text-muted-foreground">{runInfo.taskId}</div>
        </div>
        <div className="flex items-center">
          <div className="text-muted-foreground"> ran for 48s ecs</div>
          {<Icon />}
        </div>
      </div>
      <Separator className={separatorColor} />
      <div className="m-4">dasdasd</div>
    </div>
  );
};

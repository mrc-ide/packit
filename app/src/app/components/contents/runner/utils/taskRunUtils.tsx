import { CircleCheck, CircleEllipsis, CircleX, Clock5 } from "lucide-react";
import { getTimeDifferenceToDisplay, TimeDifference } from "../../../../../lib/time";
import { RunInfo } from "../types/RunInfo";

const getTimeInDisplayFormat = (timeDifference: TimeDifference[]) => {
  return timeDifference.slice(0).reduce((acc, { unit, value }) => {
    return `${acc} ${value} ${unit[0]}`;
  }, "");
};
// update to be bg specific and theme specific. probably extract into helper function which returns needed specific
// eg bg-color, color, icon, times to show, etc..
//  add interface for return type
export const getStatusDisplay = (runInfo: RunInfo) => {
  switch (runInfo.status) {
    case "PENDING":
      return {
        borderColor: "border-gray-500",
        separatorColor: "bg-gray-500",
        icon: () => <CircleEllipsis size={56} absoluteStrokeWidth={true} className="text-background fill-gray-400" />,
        displayDuration: `Waiting for ${getTimeInDisplayFormat(
          getTimeDifferenceToDisplay(runInfo.timeQueued as number)
        )}`,
        displayStartTimeStamp: `Queued on ${new Date((runInfo.timeQueued as number) * 1000).toLocaleString()}`
      };
    case "RUNNING":
      return {
        borderColor: "border-yellow-500",
        separatorColor: "bg-yellow-500",
        icon: () => <Clock5 size={56} absoluteStrokeWidth={true} className="text-background fill-yellow-400" />,
        displayDuration: `Running for ${getTimeInDisplayFormat(
          getTimeDifferenceToDisplay(runInfo.timeStarted as number)
        )}`,
        displayStartTimeStamp: `Started ${new Date((runInfo.timeStarted as number) * 1000).toLocaleString()}`
      };
    case "COMPLETE":
      return {
        borderColor: "border-green-500",
        separatorColor: "bg-green-500",
        icon: () => <CircleCheck size={56} absoluteStrokeWidth={true} className="text-background fill-green-400" />,
        displayDuration: `Ran in ${getTimeInDisplayFormat(
          getTimeDifferenceToDisplay(runInfo.timeStarted as number, runInfo.timeCompleted as number)
        )}`,
        displayStartTimeStamp: `Started ${new Date((runInfo.timeStarted as number) * 1000).toLocaleString()}`
      };
    default:
      // error, cancelled, died, timeout, missing, moved, deferred, impossible
      return {
        borderColor: "border-red-500",
        separatorColor: "bg-red-500",
        icon: () => <CircleX size={56} absoluteStrokeWidth={true} className="text-background fill-red-400" />,
        displayDuration: runInfo.timeCompleted
          ? `Failed in ${getTimeInDisplayFormat(
              getTimeDifferenceToDisplay(runInfo.timeStarted as number, runInfo.timeCompleted as number)
            )}`
          : "Failed",
        displayStartTimeStamp: `Started ${new Date((runInfo.timeStarted as number) * 1000).toLocaleString()}`
      };
  }
};

import { CircleCheck, CircleEllipsis, CircleX, Clock5 } from "lucide-react";
import { getTimeDifferenceToDisplay, TimeDifference } from "../../../../../lib/time";
import { RunInfo } from "../types/RunInfo";

interface RunStatusDisplay {
  borderColor: string;
  separatorColor: string;
  bgColor: string;
  icon: () => JSX.Element;
  displayDuration: string;
  displayStartTimeStamp: string;
}
export const getStatusDisplayByStatus = (runInfo: RunInfo): RunStatusDisplay => {
  switch (runInfo.status) {
    case "PENDING":
      return {
        borderColor: "border-gray-400 dark:border-gray-700",
        separatorColor: "bg-gray-400 dark:bg-gray-700",
        icon: () => <CircleEllipsis size={56} absoluteStrokeWidth={true} className="text-background fill-gray-400" />,
        displayDuration: `Waiting for ${getTimeInDisplayFormat(
          getTimeDifferenceToDisplay(runInfo.timeQueued as number)
        )}`,
        displayStartTimeStamp: `Queued on ${new Date((runInfo.timeQueued as number) * 1000).toLocaleString()}`,
        bgColor: "bg-gray-50 dark:bg-gray-950"
      };
    case "RUNNING":
      return {
        borderColor: "border-yellow-400 dark:border-yellow-700",
        separatorColor: "bg-yellow-400 dark:bg-yellow-700",
        icon: () => <Clock5 size={56} absoluteStrokeWidth={true} className="text-background fill-yellow-400" />,
        displayDuration: `Running for ${getTimeInDisplayFormat(
          getTimeDifferenceToDisplay(runInfo.timeStarted as number)
        )}`,
        displayStartTimeStamp: `Started ${new Date((runInfo.timeStarted as number) * 1000).toLocaleString()}`,
        bgColor: "bg-yellow-50 dark:bg-yellow-950"
      };
    case "COMPLETE":
      return {
        borderColor: "border-green-400 dark:border-green-700",
        separatorColor: "bg-green-400 dark:bg-green-700",
        icon: () => <CircleCheck size={56} absoluteStrokeWidth={true} className="text-background fill-green-400" />,
        displayDuration: `Ran in ${getTimeInDisplayFormat(
          getTimeDifferenceToDisplay(runInfo.timeStarted as number, runInfo.timeCompleted as number)
        )}`,
        displayStartTimeStamp: `Started ${new Date((runInfo.timeStarted as number) * 1000).toLocaleString()}`,
        bgColor: "bg-green-50 dark:bg-green-950"
      };
    default:
      // error, cancelled, died, timeout, missing, moved, deferred, impossible
      return {
        borderColor: "border-red-700",
        separatorColor: "bg-red-700",
        icon: () => <CircleX size={56} absoluteStrokeWidth={true} className="text-background fill-red-400 " />,
        displayDuration: runInfo.timeCompleted
          ? `Failed in ${getTimeInDisplayFormat(
              getTimeDifferenceToDisplay(runInfo.timeStarted as number, runInfo.timeCompleted as number)
            )}`
          : "Failed",
        displayStartTimeStamp: `Started ${new Date((runInfo.timeStarted as number) * 1000).toLocaleString()}`,
        bgColor: "bg-red-50 dark:bg-red-950"
      };
  }
};

/**
 * Returns in largest 2 time units and their units abbreviated to first character.
 *
 * @example
 * getTimeInDisplayFormat([{ unit: "days", value: 1 }, { unit: "hours", value: 1 }, { unit: "minutes", value: 1 }])
 * returns "1 d 1 h"
 */
export const getTimeInDisplayFormat = (timeDifference: TimeDifference[]): string => {
  return timeDifference.slice(0, 2).reduce((acc, { unit, value }) => {
    return `${acc} ${value} ${unit[0]}`;
  }, "");
};

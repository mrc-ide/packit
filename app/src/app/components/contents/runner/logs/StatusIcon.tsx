import { Check, Ellipsis, LoaderCircle, X } from "lucide-react";
import { cn } from "@lib/cn";
import { Status } from "../types/RunInfo";

interface StatusIconProps {
  iconClassName?: string;
  iconWrapperClassName?: string;
  status: Status;
}
export const StatusIcon = ({ iconClassName, iconWrapperClassName, status }: StatusIconProps) => {
  switch (status) {
    case "PENDING":
      return (
        <div
          className={cn(
            "w-11 h-11 rounded-full bg-gray-400 flex items-center justify-center m-1",
            iconWrapperClassName
          )}
        >
          <Ellipsis className={cn("text-background w-6 h-6", iconClassName)} />
        </div>
      );

    case "RUNNING":
      return (
        <div
          className={cn(
            "w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center m-1",
            iconWrapperClassName
          )}
        >
          <LoaderCircle className={cn("animate-spin text-background stroke-[3px] w-6 h-6", iconClassName)} />
        </div>
      );
    case "COMPLETE":
      return (
        <div
          className={cn(
            "w-11 h-11 rounded-full bg-green-400 flex items-center justify-center m-1",
            iconWrapperClassName
          )}
        >
          <Check className={cn("text-background w-6 h-6", iconClassName)} />
        </div>
      );

    default:
      // error, cancelled, died, timeout, missing, moved, deferred, impossible
      return (
        <div
          className={cn("w-11 h-11 rounded-full bg-red-400 flex items-center justify-center m-1", iconWrapperClassName)}
        >
          <X className={cn("text-background w-6 h-6", iconClassName)} />
        </div>
      );
  }
};

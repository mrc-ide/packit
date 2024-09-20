import { CircleCheck, CircleEllipsis, CircleX, LoaderCircle } from "lucide-react";
import { Status } from "../types/RunInfo";
import { cn } from "../../../../../lib/cn";

interface StatusIconProps {
  iconClassName?: string;
  iconWrapperClassName?: string;
  status: Status;
}
export const StatusIcon = ({ iconClassName, iconWrapperClassName, status }: StatusIconProps) => {
  switch (status) {
    case "PENDING":
      return <CircleEllipsis className={cn("text-background fill-gray-400 w-14 h-14 stroke-1", iconClassName)} />;
    case "RUNNING":
      return (
        <div
          className={cn(
            "w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center m-1",
            iconWrapperClassName
          )}
        >
          <LoaderCircle className={cn("animate-spin text-background stroke-[3px] w-7 h-7", iconClassName)} />
        </div>
      );
    case "COMPLETE":
      return <CircleCheck className={cn("text-background fill-green-400 w-14 h-14 stroke-1", iconClassName)} />;
    default:
      // error, cancelled, died, timeout, missing, moved, deferred, impossible
      return <CircleX className={cn("text-background fill-red-400 w-14 h-14 stroke-1", iconClassName)} />;
  }
};

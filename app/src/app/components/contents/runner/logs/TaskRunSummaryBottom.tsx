import { Github } from "lucide-react";
import { NavLink } from "react-router-dom";
import { buttonVariants } from "../../../Base/Button";
import { Separator } from "../../../Base/Separator";
import { RunInfo } from "../types/RunInfo";

interface TaskSummaryTopProps {
  runInfo: RunInfo;
  displayStartTimeStamp: string;
}
export const TaskRunSummaryBottom = ({ runInfo, displayStartTimeStamp }: TaskSummaryTopProps) => {
  return (
    <div className="p-4 flex justify-between space-x-4">
      <div className="flex flex-col text-muted-foreground space-y-2">
        <div>Ran by {runInfo.ranBy}</div>
        <Separator />
        <div>{displayStartTimeStamp}</div>
      </div>

      <div className="flex flex-col space-y-2 md:max-w-lg">
        <div className="flex flex-wrap gap-1">
          {runInfo.parameters ? (
            Object.entries(runInfo.parameters).map(([key, val]) => (
              <div key={key} className="border py-1 px-1.5 rounded-md flex space-x-1 text-xs">
                <div>{key}: </div>
                <div className="text-muted-foreground"> {val.toString()}</div>
              </div>
            ))
          ) : (
            <div className="italic text-sm text-muted-foreground">Parameters: None</div>
          )}
        </div>
        <Separator />
        <div className="flex h-6 items-center space-x-1 text-muted-foreground text-sm">
          <Github size={15} />
          <div>{runInfo.branch}</div>
          <Separator orientation="vertical" />
          <div>{runInfo.commitHash.slice(0, 7)}</div>
        </div>
      </div>

      {!runInfo.packetId ? (
        <NavLink
          to={`/${runInfo.packetGroupName}/${runInfo.packetId}`}
          className={buttonVariants({ variant: "outline" })}
        >
          View
        </NavLink>
      ) : (
        <div></div>
      )}
    </div>
  );
};

import { Github } from "lucide-react";
import { NavLink } from "react-router-dom";
import { buttonVariants } from "../../../Base/Button";
import { Separator } from "../../../Base/Separator";
import { RunInfo } from "../types/RunInfo";
import { ParameterContainer } from "../../common/ParameterContainer";

interface TaskSummaryTopProps {
  runInfo: RunInfo;
  displayStartTimeStamp: string;
}

export const TaskRunSummaryBottom = ({ runInfo, displayStartTimeStamp }: TaskSummaryTopProps) => {
  return (
    <div className="p-4 flex justify-between space-x-4">
      <div className="flex flex-col text-muted-foreground space-y-2">
        <div>Ran by {runInfo.ranBy}</div>
        <div>{displayStartTimeStamp}</div>
      </div>

      <div className="flex flex-col space-y-2 md:max-w-lg">
        <div className="flex items-center space-x-1 text-muted-foreground">
          <Github size={15} />
          <div>{runInfo.branch}</div>
          <Separator orientation="vertical" />
          <div>{runInfo.commitHash.slice(0, 7)}</div>
        </div>

        <div className="flex flex-wrap gap-1 max-h-64">
          {runInfo.parameters ? (
            Object.entries(runInfo.parameters).map(([key, val]) => (
              <ParameterContainer key={key} paramKey={key} paramValue={val} />
            ))
          ) : (
            <div className="italic text-muted-foreground">Parameters: None</div>
          )}
        </div>
      </div>

      {runInfo.packetId ? (
        <NavLink
          to={`/${runInfo.packetGroupName}/${runInfo.packetId}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View Packet
        </NavLink>
      ) : (
        <div></div>
      )}
    </div>
  );
};

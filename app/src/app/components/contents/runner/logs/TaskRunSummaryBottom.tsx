import { Github } from "lucide-react";
import { Separator } from "@components/Base/Separator";
import { ParameterContainer } from "../../common/ParameterContainer";
import { RunInfo } from "../types/RunInfo";
import { TaskRunSummaryBottomButton } from "./TaskRunSummaryBottomButton";

interface TaskSummaryTopProps {
  runInfo: RunInfo;
  createdTime: Date;
  startTime?: Date;
  finishTime?: Date;
}

export const TaskRunSummaryBottom = ({ runInfo, createdTime, startTime, finishTime }: TaskSummaryTopProps) => (
  <div className="p-4 flex justify-between space-x-4">
    <div className="flex flex-col text-muted-foreground space-y-2">
      <div>Run by {runInfo.runBy}</div>
      <div className="flex flex-col text-sm space-y-0.5">
        <div>Created at {createdTime.toLocaleString()}</div>
        {startTime && <div>Started at {startTime.toLocaleString()}</div>}
        {finishTime && <div>Finished at {finishTime.toLocaleString()}</div>}
      </div>
    </div>

    <div className="flex flex-col space-y-2 md:max-w-lg">
      <div className="flex items-center space-x-1 text-muted-foreground">
        <Github size={15} />
        <div>{runInfo.branch}</div>
        <Separator orientation="vertical" />
        <div>{runInfo.commitHash.slice(0, 7)}</div>
      </div>

      <div className="flex flex-wrap gap-1 max-h-72 overflow-auto">
        {runInfo.parameters ? (
          Object.entries(runInfo.parameters).map(([key, val]) => (
            <ParameterContainer key={key} paramKey={key} paramValue={val} />
          ))
        ) : (
          <div className="italic text-muted-foreground">Parameters: None</div>
        )}
      </div>
    </div>
    <TaskRunSummaryBottomButton runInfo={runInfo} />
  </div>
);

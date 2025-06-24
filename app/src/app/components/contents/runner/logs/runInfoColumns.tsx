import { createColumnHelper } from "@tanstack/react-table";
import { CircleOff, ExternalLink, GitBranch, GitCommit } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { getTimeDifferenceToDisplay } from "../../../../../lib/time";
import { Button } from "../../../Base/Button";
import { ScrollArea } from "../../../Base/ScrollArea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../Base/Tooltip";
import { ParameterContainer } from "../../common/ParameterContainer";
import { useCancelTask } from "../hooks/useCancelTask";
import { BasicRunInfo } from "../types/RunInfo";
import { isUnfinishedStatus } from "../utils/taskRunUtils";
import { StatusIcon } from "./StatusIcon";

const columnHelper = createColumnHelper<BasicRunInfo>();
export const runInfoColumns = [
  columnHelper.accessor("packetGroupName", {
    header: "",
    cell: ({ row }) => {
      const { packetGroupName, taskId, status } = row.original;
      const { cancelTask, cancelInitiated } = useCancelTask(taskId);
      return (
        <div className="flex space-x-2 items-center">
          <div className="flex flex-col space-y-1 justify-center items-center">
            <StatusIcon status={status} iconClassName="h-4 w-4 stroke-2" iconWrapperClassName="h-7 w-7 m-0.5" />

            {isUnfinishedStatus(status) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`cancel-${taskId}`}
                      className="hover:bg-red-100 dark:hover:bg-red-950 h-6 w-6"
                      onClick={cancelTask}
                      disabled={cancelInitiated}
                    >
                      <CircleOff className="h-3 w-3 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    <p>Cancel task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex flex-col">
            <Link to={`${taskId}`} className="hover:underline decoration-blue-500 font-semibold text-blue-500">
              {packetGroupName}
            </Link>
            <div className="text-xs text-muted-foreground">{taskId}</div>
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor("runBy", {
    header: "User",
    cell: ({ getValue }) => {
      const runBy = getValue();
      return <div>{runBy}</div>;
    }
  }),
  columnHelper.accessor("parameters", {
    header: "Parameters",
    cell: ({ getValue }) => {
      const parameters = getValue();
      return !parameters || Object.keys(parameters)?.length === 0 ? (
        <div>
          <div className="italic">None</div>
        </div>
      ) : (
        <ScrollArea className="h-12" type="auto">
          <div className="flex flex-wrap gap-[1px]">
            {Object.entries(parameters).map(([key, val]) => (
              <ParameterContainer key={key} paramKey={key} paramValue={val} />
            ))}
          </div>
        </ScrollArea>
      );
    }
  }),
  columnHelper.accessor("timeQueued", {
    header: "Time Created",
    cell: ({ row }) => {
      const { timeQueued } = row.original;
      const { unit, value } = getTimeDifferenceToDisplay(timeQueued as number)[0];

      return (
        <div>
          Created {value} {unit} ago
        </div>
      );
    }
  }),
  columnHelper.accessor("branch", {
    header: "Git Info",
    cell: ({ row }) => {
      const { branch, commitHash } = row.original;
      return (
        <div className="flex flex-col space-y-1">
          <div className="flex space-x-1">
            <GitBranch size={18} />
            <div>{branch}</div>
          </div>
          <div className="flex space-x-1">
            <GitCommit size={18} />
            <div>{commitHash.slice(0, 7)}</div>
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor("packetId", {
    header: "Packet",
    cell: ({ row }) => {
      const { packetId, packetGroupName } = row.original;
      return packetId ? (
        <NavLink
          to={`/${packetGroupName}/${packetId}`}
          className=" text-blue-500  flex items-center gap-0.5 
      hover:underline decoration-blue-500"
        >
          <ExternalLink size={16} />
          View
        </NavLink>
      ) : (
        <div>
          <div className="italic">N/A</div>
        </div>
      );
    }
  })
];

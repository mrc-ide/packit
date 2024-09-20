import { createColumnHelper } from "@tanstack/react-table";
import { ExternalLink, GitBranch, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { getTimeDifferenceToDisplay } from "../../../../../lib/time";
import { ScrollArea } from "../../../Base/ScrollArea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../Base/Tooltip";
import { ParameterContainer } from "../../common/ParameterContainer";
import { BasicRunInfo } from "../types/RunInfo";
import { StatusIcon } from "./StatusIcon";

const columnHelper = createColumnHelper<BasicRunInfo>();
export const runInfoColumns = [
  columnHelper.accessor("packetGroupName", {
    header: "",
    cell: ({ row }) => {
      const { packetGroupName, taskId, packetId, status } = row.original;
      const iconClassName = status === "RUNNING" ? "h-4 w-4 stroke-2" : "h-8 w-8";

      return (
        <div className="flex space-x-2">
          <StatusIcon status={status} iconClassName={iconClassName} iconWrapperClassName="h-7 w-7 m-0.5" />
          <div className="flex flex-col">
            <Link to={`${taskId}`} className="hover:underline decoration-blue-500 font-semibold text-blue-500">
              {packetGroupName}
            </Link>
            <div className="flex space-x-2">
              <div className="text-xs text-muted-foreground">{taskId}</div>
              {packetId && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={`/${packetGroupName}/${packetId}`} className="text-blue-500">
                        <ExternalLink size={15} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Go to packet</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor("ranBy", {
    header: "User",
    cell: ({ getValue }) => {
      const ranBy = getValue();
      return <div>{ranBy}</div>;
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
            <Github size={18} />
            <div>{commitHash.slice(0, 7)}</div>
          </div>
        </div>
      );
    }
  })
];

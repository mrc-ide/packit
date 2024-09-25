import { createColumnHelper } from "@tanstack/react-table";
import { ExternalLink, GitBranch, GitCommit } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { getTimeDifferenceToDisplay } from "../../../../../lib/time";
import { ScrollArea } from "../../../Base/ScrollArea";
import { ParameterContainer } from "../../common/ParameterContainer";
import { BasicRunInfo } from "../types/RunInfo";
import { StatusIcon } from "./StatusIcon";

const columnHelper = createColumnHelper<BasicRunInfo>();
export const runInfoColumns = [
  columnHelper.accessor("packetGroupName", {
    header: "",
    cell: ({ row }) => {
      const { packetGroupName, taskId, status } = row.original;

      return (
        <div className="flex space-x-2 items-center">
          <StatusIcon status={status} iconClassName="h-4 w-4 stroke-2" iconWrapperClassName="h-7 w-7 m-0.5" />
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

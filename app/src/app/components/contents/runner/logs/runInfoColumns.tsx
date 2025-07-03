import { createColumnHelper } from "@tanstack/react-table";
import { GitBranch, GitCommit, Loader2 } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { getTimeDifferenceToDisplay } from "@lib/time";
import { Button, buttonVariants } from "@components/Base/Button";
import { ScrollArea } from "@components/Base/ScrollArea";
import { ParameterContainer } from "../../common/ParameterContainer";
import { useCancelTask } from "../hooks/useCancelTask";
import { BasicRunInfo } from "../types/RunInfo";
import { isUnfinishedStatus } from "../utils/taskRunUtils";
import { StatusIcon } from "./StatusIcon";
import { Separator } from "@components/Base/Separator";

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
  columnHelper.display({
    header: "Actions",
    cell: ({ row }) => {
      const { packetId, packetGroupName, status, taskId } = row.original;
      const { cancelTask, cancelInitiated } = useCancelTask(taskId);

      if (isUnfinishedStatus(status))
        return (
          <Button
            variant="destructive"
            size="sm"
            aria-label={`cancel-${taskId}`}
            onClick={cancelTask}
            disabled={cancelInitiated}
            className="text-xs"
          >
            {cancelInitiated ? <Loader2 className="h-4 w-4 mx-2.5 animate-spin" /> : "Cancel"}
          </Button>
        );

      if (packetId)
        return (
          <NavLink to={`/${packetGroupName}/${packetId}`} className={buttonVariants({ size: "sm" })}>
            <span className="text-xs">&nbsp;View&nbsp;</span>
          </NavLink>
        );

      return (
        <div className="flex">
          <div className="w-12">
            <Separator className="border-green bg-slate-400" />
          </div>
        </div>
      );
    }
  })
];

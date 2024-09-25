import { useState } from "react";
import { FilterInput } from "../common/FilterInput";
import { PAGE_SIZE } from "../../../../lib/constants";
import { TasksLogsTable } from "./logs/TasksLogsTable";

export const PacketRunTasksLogs = () => {
  const [pageNumber, setPageNumber] = useState(0);
  const [filterPacketGroupName, setFilterPacketGroupName] = useState("");

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Logs</h2>
        <p className="text-muted-foreground">View the status and logs of packet runs</p>
      </div>
      <div className="space-y-4 flex flex-col mt-4">
        <FilterInput
          setFilter={setFilterPacketGroupName}
          postFilterAction={() => setPageNumber(0)}
          placeholder="Filter by packet group name..."
        />
        <TasksLogsTable
          filterPacketGroupName={filterPacketGroupName}
          pageNumber={pageNumber}
          pageSize={PAGE_SIZE}
          setPageNumber={setPageNumber}
        />
      </div>
    </>
  );
};

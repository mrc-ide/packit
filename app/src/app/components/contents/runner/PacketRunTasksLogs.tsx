import { useState } from "react";
import { FilterInput } from "../common/FilterInput";
import { PAGE_SIZE } from "../../../../lib/constants";
import { TasksLogsList } from "./logs/TasksLogsList";

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
          placeholder="filter packet group names..."
        />
        <TasksLogsList
          filterPacketGroupName={filterPacketGroupName}
          pageNumber={pageNumber}
          pageSize={PAGE_SIZE}
          setPageNumber={setPageNumber}
        />
      </div>
    </>
  );
};

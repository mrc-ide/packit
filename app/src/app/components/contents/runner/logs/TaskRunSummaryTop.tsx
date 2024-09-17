import React from "react";

interface TaskSummaryTopProps {
  packetGroupName: string;
  taskId: string;
  displayDuration: string;
  Icon: React.FC;
}
export const TaskRunSummaryTop = ({ packetGroupName, taskId, displayDuration, Icon }: TaskSummaryTopProps) => {
  return (
    <div className=" flex justify-between items-center p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold text-xl tracking-tight">{packetGroupName}</h3>
        <div className="text-muted-foreground">{taskId}</div>
      </div>
      <div className="flex items-center">
        <div className="text-muted-foreground mr-1"> {displayDuration}</div>
        {<Icon />}
      </div>
    </div>
  );
};

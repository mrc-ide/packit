import React from "react";

interface TaskSummaryTopProps {
  packetGroupName: string;
  taskId: string;
  displayDuration: string;
  Icon: React.FC;
  bgColor: string;
}
export const TaskRunSummaryTop = ({ packetGroupName, taskId, displayDuration, Icon, bgColor }: TaskSummaryTopProps) => {
  return (
    <div className={`flex justify-between items-center p-4 rounded-md ${bgColor}`}>
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

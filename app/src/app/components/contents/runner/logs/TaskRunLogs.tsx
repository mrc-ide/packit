import { memo } from "react";

interface TaskRunLogsProps {
  logs?: string[] | null;
}
export const TaskRunLogs = memo(function TaskRunLogs({ logs }: TaskRunLogsProps) {
  return (
    <div className="rounded-md border bg-black text-white">
      <div className="p-4">
        <h3 className="font-semibold text-xl mb-2">Logs</h3>
        {logs && logs.length > 0 ? (
          logs.map((log) => (
            <div key={log} className="text-sm font-mono p-1">
              {log}
            </div>
          ))
        ) : (
          <div className="text-muted-foreground text-sm font-mono">No logs available yet...</div>
        )}
      </div>
    </div>
  );
});

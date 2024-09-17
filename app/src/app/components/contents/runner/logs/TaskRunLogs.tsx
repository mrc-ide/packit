interface TaskRunLogsProps {
  logs?: string[] | null;
}
export const TaskRunLogs = ({ logs }: TaskRunLogsProps) => (
  <div className="rounded-md border bg-black text-white">
    <div className="p-4">
      <h3 className="font-semibold text-xl mb-2">Logs</h3>
      {logs && logs.length > 0 ? (
        logs.map((log) => (
          <div key={log} className="text-sm font-mono p-2">
            {log}
          </div>
        ))
      ) : (
        <div className="text-muted-foreground text-sm font-mono">No logs available yet...</div>
      )}
    </div>
  </div>
);

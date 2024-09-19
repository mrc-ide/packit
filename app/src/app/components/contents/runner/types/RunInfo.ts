export interface RunInfo {
  taskId: string;
  packetGroupName: string;
  status: Status;
  commitHash: string;
  branch: string;
  logs?: string[] | null;
  timeStarted?: number | null;
  timeCompleted?: number | null;
  timeQueued?: number | null;
  packetId?: string | null;
  parameters?: Record<string, string | number | boolean> | null;
  queuePosition?: number | null;
  ranBy: string;
}

export type Status =
  | "PENDING"
  | "RUNNING"
  | "COMPLETE"
  | "ERROR"
  | "CANCELLED"
  | "DIED"
  | "TIMEOUT"
  | "MISSING"
  | "MOVED"
  | "DEFERRED"
  | "IMPOSSIBLE";

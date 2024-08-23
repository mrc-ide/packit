-- Create run info table
CREATE TABLE IF NOT EXISTS "run_info"
(
    "task_id"             TEXT PRIMARY KEY NOT NULL,
    "status"              TEXT,
    "commit_hash"         TEXT NOT NULL,
    "branch"              TEXT NOT NULL,
    "logs"                JSON,
    "time_started"        DOUBLE PRECISION,
    "time_completed"      DOUBLE PRECISION,
    "time_queued"         DOUBLE PRECISION,
    "packet_id"           TEXT,
    "parameters"          JSON,
    "packet_group_name"   TEXT NOT NULL,
);

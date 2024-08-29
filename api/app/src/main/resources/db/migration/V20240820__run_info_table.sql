-- Create run info table
CREATE TABLE IF NOT EXISTS "run_info"
(
    "task_id"             TEXT PRIMARY KEY NOT NULL,
    "packet_group_name"   TEXT NOT NULL,
    "status"              TEXT,
    "commit_hash"         TEXT NOT NULL,
    "branch"              TEXT NOT NULL,
    "parameters"          JSON,
    "logs"                JSON,
    "time_started"        DOUBLE PRECISION,
    "time_completed"      DOUBLE PRECISION,
    "time_queued"         DOUBLE PRECISION,
    "queue_position"      INT,
    "packet_id"           TEXT
);

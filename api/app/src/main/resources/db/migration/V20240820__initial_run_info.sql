-- Create run info table
CREATE TABLE IF NOT EXISTS "run_info"
(
    "task_id"             TEXT PRIMARY KEY NOT NULL,
    "status"              TEXT,
    "commit_hash"         TEXT,
    "branch"              TEXT,
    "logs"                TEXT,
    "time_started"        DOUBLE PRECISION,
    "time_completed"      DOUBLE PRECISION,
    "time_queued"         DOUBLE PRECISION,
    "packet_id"           TEXT,
    "parameters"          JSON,
    "packet_group_id"     INT NOT NULL,
    FOREIGN KEY ("packet_group_id") REFERENCES "packet_group" ("id") ON DELETE CASCADE
);

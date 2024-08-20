-- Create run info table
CREATE TABLE IF NOT EXISTS "run_info"
(
    "task_id"             TEXT PRIMARY KEY,
    "status"              TEXT NULL,
    "time_started"        DOUBLE PRECISION NULL,
    "time_completed"      DOUBLE PRECISION NULL,
    "time_queued"         DOUBLE PRECISION NULL,
    "packet_id"           TEXT NULL,
    "packet_group_name"   TEXT NOT NULL,
    FOREIGN KEY ("packet_group_name") REFERENCES "packet_group" ("name") ON DELETE CASCADE
);

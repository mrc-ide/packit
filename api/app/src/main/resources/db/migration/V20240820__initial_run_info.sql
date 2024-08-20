-- Create run info table
CREATE TABLE IF NOT EXISTS "run_info"
(
    "id"             TEXT PRIMARY KEY,
    "status"              TEXT NULL,
    "commit_hash"         TEXT,
    "branch"              TEXT,
    "logs"                TEXT NULL,
    "time_started"        DOUBLE PRECISION NULL,
    "time_completed"      DOUBLE PRECISION NULL,
    "time_queued"         DOUBLE PRECISION NULL,
    "packet_id"           TEXT NULL,
    "parameters"          JSON NULL,
    "packet_group_name"   TEXT NOT NULL,
    FOREIGN KEY ("packet_group_name") REFERENCES "packet_group" ("name") ON DELETE CASCADE
);

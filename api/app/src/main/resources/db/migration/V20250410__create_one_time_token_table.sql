CREATE TABLE IF NOT EXISTS "one_time_token"
(
    "id"         UUID PRIMARY KEY,
    "packet_id"  TEXT                     NOT NULL,
    "file_paths" TEXT[]                   NOT NULL,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY ("packet_id") REFERENCES "packet" ("id") ON DELETE CASCADE
);

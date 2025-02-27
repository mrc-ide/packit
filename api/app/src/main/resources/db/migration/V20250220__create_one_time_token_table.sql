CREATE TABLE IF NOT EXISTS "one_time_token"
(
    "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "packet_id"  TEXT      NOT NULL,
    "file_paths" TEXT[]    NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    FOREIGN KEY ("packet_id") REFERENCES "packet" ("id") ON DELETE CASCADE
);

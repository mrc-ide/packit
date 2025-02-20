CREATE TABLE IF NOT EXISTS "one_time_token"
(
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "packet_id" TEXT      NOT NULL,
    "user_id"   UUID      NOT NULL,
    "files"     TEXT[]    NOT NULL,
    "expires"   TIMESTAMP NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("packet_id") REFERENCES "packet" ("id") ON DELETE CASCADE
);

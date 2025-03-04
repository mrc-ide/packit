DROP TABLE IF EXISTS "pinned_packet_global";

CREATE TABLE IF NOT EXISTS "pin"
(
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "packet_id" TEXT,
    FOREIGN KEY ("packet_id") REFERENCES "packet" ("id") ON DELETE CASCADE
);

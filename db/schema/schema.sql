-- to allow for the use of generating UUIDs
CREATE EXTENSION
IF NOT EXISTS pgcrypto;


CREATE TABLE "user"
(
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "password" TEXT,
    "email" TEXT NOT NULL,
    -- todo: unsure if need below data
    "disabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "user_source" TEXT,
    "last_logged_in" TEXT
);

CREATE TABLE "user_group"
(
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "role" TEXT NOT NULL
);

CREATE TABLE "user_group_user"
(
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "user_group_id" UUID NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user" ("id"),
    FOREIGN KEY ("user_group_id") REFERENCES "user_group" ("id")
);

CREATE TABLE "permission"
(
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL
);

CREATE TABLE "user_group_permission"
(
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_group_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "scope_prefix" TEXT NOT NULL,
    "scope_id" TEXT NULL,
    FOREIGN KEY ("user_group_id") REFERENCES "user_group" ("id"),
    FOREIGN KEY ("permission_id") REFERENCES "permission" ("id")
);

CREATE TABLE "pinned_packet_global"
(
    "ordering" INTEGER NOT NULL UNIQUE,
    "report" TEXT NOT NULL UNIQUE
);

CREATE TABLE "document"
(
    "path" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "show" BOOLEAN NOT NULL DEFAULT TRUE,
    "display_name" TEXT,
    "description" TEXT,
    "parent" TEXT NULL,
    "is_file" BOOLEAN NOT NULL DEFAULT TRUE,
    "external" BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY ("parent") REFERENCES "document" ("path")
);

CREATE TABLE "settings"
(
    "auth_allow_guest" BOOLEAN
);

CREATE TABLE "packet"
(
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NULL,
    "parameters" JSON NULL,
    "published" BOOLEAN NOT NULL DEFAULT FALSE,
    "import_time" DOUBLE PRECISION NOT NULL,
    "start_time" DOUBLE PRECISION NOT NULL,
    "end_time" DOUBLE PRECISION NOT NULL
);
CREATE INDEX idx_name ON packet (name);

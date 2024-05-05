-- to allow for the use of generating UUIDs
CREATE EXTENSION
    IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "user"
(
    "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "username"       TEXT    NOT NULL UNIQUE,
    "display_name"   TEXT,
    "password"       TEXT,
    "email"          TEXT,
    "disabled"       BOOLEAN NOT NULL DEFAULT FALSE,
    "user_source"    TEXT,
    "last_logged_in" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "role"
(
    "id"          SERIAL PRIMARY KEY,
    "name"        text    NOT NULL UNIQUE,
    "is_username" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "permission"
(
    "id"          SERIAL PRIMARY KEY,
    "name"        text UNIQUE NOT NULL,
    "description" text
);


CREATE TABLE IF NOT EXISTS "tag"
(
    "id"   SERIAL PRIMARY KEY,
    "name" text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "packet_group"
(
    "id"   SERIAL PRIMARY KEY,
    "name" text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "packet"
(
    "id"           TEXT PRIMARY KEY NOT NULL,
    "name"         TEXT             NOT NULL,
    "display_name" TEXT             NULL,
    "parameters"   JSON             NULL,
    "published"    BOOLEAN          NOT NULL DEFAULT FALSE,
    "import_time"  DOUBLE PRECISION NOT NULL,
    "start_time"   DOUBLE PRECISION NOT NULL,
    "end_time"     DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_role"
(
    "id"      SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "role_id" INT  NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE CASCADE,
    CONSTRAINT user_role_unique UNIQUE ("user_id", "role_id")
);

CREATE TABLE IF NOT EXISTS "role_permission"
(
    "id"              SERIAL PRIMARY KEY,
    "role_id"         int NOT NULL,
    "permission_id"   int NOT NULL,
    "packet_id"       text,
    "packet_group_id" int,
    "tag_id"          int,
    FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("permission_id") REFERENCES "permission" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("packet_id") REFERENCES "packet" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("packet_group_id") REFERENCES "packet_group" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE CASCADE,
--     All NULL or only one of the following columns can be NOT NULL
    CHECK (
            (packet_id IS NULL AND packet_group_id IS NULL AND tag_id IS NULL) OR
            (packet_id IS NOT NULL AND packet_group_id IS NULL AND tag_id IS NULL) OR
            (packet_id IS NULL AND packet_group_id IS NOT NULL AND tag_id IS NULL) OR
            (packet_id IS NULL AND packet_group_id IS NULL AND tag_id IS NOT NULL)
        )
);

CREATE TABLE IF NOT EXISTS "packet_tag"
(
    "id"        SERIAL PRIMARY KEY,
    "packet_id" TEXT NOT NULL,
    "tag_id"    INT  NOT NULL,
    FOREIGN KEY ("packet_id") REFERENCES "packet" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS "pinned_packet_global"
(
    "ordering" INTEGER NOT NULL UNIQUE,
    "report"   TEXT    NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "document"
(
    "path"         TEXT PRIMARY KEY NOT NULL,
    "name"         TEXT             NOT NULL,
    "show"         BOOLEAN          NOT NULL DEFAULT TRUE,
    "display_name" TEXT,
    "description"  TEXT,
    "parent"       TEXT             NULL,
    "is_file"      BOOLEAN          NOT NULL DEFAULT TRUE,
    "external"     BOOLEAN          NOT NULL DEFAULT FALSE,
    FOREIGN KEY ("parent") REFERENCES "document" ("path")
);

CREATE TABLE IF NOT EXISTS "settings"
(
    "auth_allow_guest" BOOLEAN
);

-- Constraints

-- indexes
CREATE INDEX ON "packet" ("name");
CREATE INDEX ON "user" ("username");
CREATE INDEX ON "user" ("email");
CREATE INDEX ON "user_role" ("user_id");
CREATE INDEX ON "user_role" ("role_id");
CREATE INDEX ON "role_permission" ("role_id");
CREATE INDEX ON "role_permission" ("permission_id");
CREATE INDEX ON "role_permission" ("packet_id");
CREATE INDEX ON "role_permission" ("packet_group_id");
CREATE INDEX ON "role_permission" ("tag_id");
CREATE INDEX ON "packet_tag" ("packet_id");
CREATE INDEX ON "packet_tag" ("tag_id");
CREATE INDEX ON "packet_group" ("name");



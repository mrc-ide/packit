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
    -- todo: unsure if need columns below can remove maybe
    "disabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "user_source" TEXT,
    "last_logged_in" TEXT
);


CREATE TABLE "user_group"
(
    "id" SERIAL PRIMARY KEY,
    "role" TEXT NOT NULL UNIQUE
);

CREATE TABLE "user_group_user"
(
    "id" SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "user_group_id" INTEGER NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user" ("id"),
    FOREIGN KEY ("user_group_id") REFERENCES "user_group" ("id")
);

CREATE TABLE "permission"
(
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "user_group_permission"
(
    "id" SERIAL PRIMARY KEY,
    "user_group_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
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

-- indexes
CREATE INDEX idx_packet_name ON "packet" ("name");
CREATE INDEX idx_user_email ON "user" ("email");
CREATE INDEX idx_user_username ON "user" ("username");
-- add role enums 
INSERT INTO "user_group"
    ("role")
VALUES
    ('ADMIN'),
    ('USER');
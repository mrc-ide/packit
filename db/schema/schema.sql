CREATE TABLE "user"
(
    "username" TEXT,
    "display_name" TEXT,
    "email" TEXT,
    "disabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "user_source" TEXT,
    "last_logged_in" TEXT,
    PRIMARY KEY ("email")
);

CREATE TABLE "user_group"
(
    "id" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE "user_group_user"
(
    "email" TEXT NOT NULL,
    "user_group" TEXT NOT NULL,
    FOREIGN KEY ("email") REFERENCES "user" ("email"),
    FOREIGN KEY ("user_group") REFERENCES "user_group" ("id")
);

CREATE TABLE "permission"
(
    "id" TEXT,
    PRIMARY KEY ("id")
);

CREATE TABLE "user_group_permission"
(
    "id" INTEGER PRIMARY KEY NOT NULL,
    "user_group" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "scope_prefix" TEXT NOT NULL,
    "scope_id" TEXT NULL,
    FOREIGN KEY ("user_group") REFERENCES "user_group" ("id"),
    FOREIGN KEY ("permission") REFERENCES "permission" ("id")
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
    "import_time" BIGINT NOT NULL,
    "start_time" DOUBLE PRECISION NOT NULL,
    "end_time" DOUBLE PRECISION NOT NULL
);
CREATE INDEX idx_name ON packet (name);

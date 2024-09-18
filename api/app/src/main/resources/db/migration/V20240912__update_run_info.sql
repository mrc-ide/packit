ALTER TABLE "run_info"
    ADD COLUMN "user_id" UUID NOT NULL,
    ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
CREATE INDEX ON "run_info" ("user_id");
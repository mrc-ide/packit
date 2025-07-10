ALTER TABLE "packet"
    ADD COLUMN "description" TEXT NULL;


-- create table for tracking one-time jobs
CREATE TABLE IF NOT EXISTS one_time_job
(
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(255) UNIQUE                                                             NOT NULL,
    status VARCHAR(20) CHECK (status IN ('NOT_STARTED', 'STARTED', 'COMPLETED', 'FAILED')) NOT NULL,
    error  TEXT
);
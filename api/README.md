# Packit API

This API is built with [Spring boot framework](https://spring.io)

## Requirements

- Eclipse temurin JDK 17
  Eclipse Temurin is the open source Java SE build based upon OpenJDK.

## Run dependencies

Before you can start packit you need to run `./scripts/run-dependencies` from the project root
to start database and `outpack_server` instances.

## Starting App

There are two ways to start the app:

1. The default dev configuration enables Github auth, but you will need to set environment variables PACKIT_GITHUB_CLIENT_ID
   and
   PACKIT_GITHUB_CLIENT_SECRET with the details of an OAuth app which you can use to log in. You can use the details held in
   the
   mrc vault at `VAULT:secret/auth/githubclient/id:value` and `VAULT:secret/auth/githubclient/secret:value`.
2. The other configuration is to use basic auth. This is enabled by setting `auth.method=basic` in `application.properties`.
3. No auth mode. This is enabled by setting `auth.enabled=false` in `application.properties`.
   Run up app on command line from the /api directory
   `./scripts/run-dev`

## Testing

Execute tests on the command line or through IntelliJ

1. `./api/gradlew -p api/app :app:test`

To run a specific test alone, add `--tests` + the \
[fully qualified class name](https://docs.gradle.org/current/userguide/java_testing.html#full_qualified_name_pattern)\
to the command. For example, the command for running AppTest.kt would
be: `./api/gradlew -p api/app :app:test --tests AppTest`

Dependencies must be running for integration tests to pass.

## Building a docker image

1. `./api/scripts/build` builds a docker image.
2. `./api/scripts/build-and-push` builds and pushes an image to dockerhub. This script is run on CI.
3. `./api/scripts/run` runs a built image with the current branch name.

## Migrations

For database migrations, we use [Flyway](https://flywaydb.org/). Flyway will look in the `db/migration` directory for SQL scripts to run.
A table called `flyway_schema_history` will be created in the database to keep track of which scripts have been run. To create a new migration
script, create a new file in the `api/app/src/main/resources/db/migration` directory with the following naming convention: `V{version}__{description}.sql`.
For example, `V20250107__create_table.sql`. The version number should be the current date in yyyymmdd and always greater than all existing version numbers. Flyway will run the scripts in order of version number.
The config `spring.jpa.hibernate.ddl-auto=validate` in application.properties will ensure Entity classes are in sync with the database schema.
The migrations and validation are run on application startup. If validation fails, the application will not start.

However, if you wish to run the migrations manually, execute the following command from the project root:
`./api/gradlew flywayInfo -Pflyway.url={url} -Pflyway.user={user} -Pflyway.password={password}`

Once a migration file has been commited to the main branch it must not be modified again. Instead you should write a new migration if you want to modify
existing tables. There is a [GitHub Actions workflow](../.github/workflows/check-migrations.yml) that ensures these cannot be changed.

Note: A intelliJ called [JpaBuddy](https://jpa-buddy.com/) can be used to generate entity classes from a database schema and visa versa.
This [tutorial](https://www.youtube.com/watch?v=9wEJ29QIDyM&t=51s) is a good starting point on how flyway and JpaBuddy can be used together.

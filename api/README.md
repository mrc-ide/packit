# Packit Backend
This Api is built with [Spring boot framework](https://spring.io)

## Requirements
- Eclipse temurin JDK 17
  Eclipse Temurin is the open source Java SE build based upon OpenJDK.

## Starting App
Run up app on command line from the project root directory
`./api/gradlew -p api/app :app:run`

## Testing
Execute tests on the command line or through IntelliJ
1. `./api/gradlew -p api/app :app:test`

To run a specific test alone, add `--test` + the \
[fully qualified class name](https://docs.gradle.org/current/userguide/java_testing.html#full_qualified_name_pattern)\
to the command. For example, the command for running AppTest.kt would be: `./api/gradlew -p api/app :app:test --tests AppTest`

## Database migration
Database uses [flyway](https://flywaydb.org/documentation/database/h2) to run migration, the scripts are located in \
`api/resources/db/migration`. Follow the naming pattern in migration folder to alter the schema \
Migration will be automatically applied when you start up the app
# Packit API
This API is built with [Spring boot framework](https://spring.io)

## Requirements
- Eclipse temurin JDK 17
  Eclipse Temurin is the open source Java SE build based upon OpenJDK.

## Run dependencies
Before you can start packit you need to run `./scripts/run-dependencies` from the project root 
to start database and `outpack_server` instances.

## Starting App
Run up app on command line from the /api directory
`./scripts/run-dev`

## Testing
Execute tests on the command line or through IntelliJ
1. `./api/gradlew -p api/app :app:test`

To run a specific test alone, add `--tests` + the \
[fully qualified class name](https://docs.gradle.org/current/userguide/java_testing.html#full_qualified_name_pattern)\
to the command. For example, the command for running AppTest.kt would be: `./api/gradlew -p api/app :app:test --tests AppTest`

Dependencies must be running for integration tests to pass. 

## Building a docker image
1. `./api/scripts/build` builds a docker image.
2. `./api/scripts/build-and-push` builds and pushes an image to dockerhub. This script is run on CI.
3. `./api/scripts/run` runs a built image with the current branch name.

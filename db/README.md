# packit-db

Postgresql database for storing packit web app data.
1. `./scripts/build` - build the db docker image
1. `./scripts/build-and-push` - build and push the db docker image
1. `./scripts/run` - run the image created in step 1 and import the schema.

## Basic Auth Admin user 
For basic auth superadmin may be needed, where the credentials are stored in the vault.(secret/packit/basicauth).

This user is created automatically when the run command is executed with the `basicauth` argument.

Now this super user can be used to create users and log in initially.

## Pin a packet

`./scripts/create-packet-pin --packet-id <id of an existing packet>`

## Development: Run direct postgres query.
This can be to insert test data or just for testing. 
```bash
./scripts/runQuery "{SQL_QUERY}"
```

# packit-db

Postgresql database for storing packit web app data.
* `./scripts/build` - build and push the db docker image
* `./scripts/run` - run the image created in step 1. and import the schema.

## Basic Auth Admin user 
For basic auth superadmin may be needed, where the credentials are stored in the vault.(secret/packit/basicauth).
This user is created automatically when the run command is execited with the `basicauth` argument.

Now this super user can be used to create users and login initially.
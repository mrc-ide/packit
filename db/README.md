# packit-db

Postgresql database for storing packit web app data.
* `./scripts/build` - build and push the db docker image
* `./scripts/run` - run the image created in step 1. and import the schema.

## Admin user 
A default superadmin is created, where the credentials are stored in the vault.(secret/packit/basicauth).
Use the username and password to login to the app for basic login.
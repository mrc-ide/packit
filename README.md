# packit

Web app for serving outpack and/or orderly2 metadata.

## Pre-requisites
Ensure you have logged into vault. If not,  Run the following command to login with github PAT token:
```
export VAULT_ADDR=https://vault.dide.ic.ac.uk:8200
vault login -method=github
```
## Quick start
To run the whole app (default is github auth):
1. `./scripts/run-dependencies` to run the database and `outpack_server`
    i. If wanting to run in basic auth mode, run `./scripts/run-dependencies basicauth`. This will create a superadmin user that can be used.
2. `./api/scripts/run` to run the API
    i. If wanting to run in basic auth mode, run `./api/scripts/run basicauth`
3. `npm start --prefix=app` to run the React app on port 3000.


There are 3 subdirectories in this repo, each corresponding to a different service. 
See individual READMEs for further details on developing each service.

## Database
See [db/README.md](https://github.com/mrc-ide/packit/blob/main/db/README.md)

## API
See [api/README.md](https://github.com/mrc-ide/packit/blob/main/api/README.md) 

## App
See [app/README.md](https://github.com/mrc-ide/packit/blob/main/app/README.md)



## Authentication in Packit
See [docs/auth.md](docs/auth.md)

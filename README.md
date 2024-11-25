# packit

Web app for serving outpack and/or orderly2 metadata.

## Pre-requisites

Ensure you have logged into vault. If not, Run the following command to login with github PAT token:

```
export VAULT_ADDR=https://vault.dide.ic.ac.uk:8200
vault login -method=github
```

## Quick start

To run the whole app (default is github auth):

```
./scripts/dev-start
```

The app will be available on port 3000. If you would like to create a super admin user then:

```
./scripts/dev-start --super-user
```

For more options:

```
./scripts/dev-start --help
```

The following commands achieve the same things but allow for finer control of each of the components:

1. `./scripts/run-dependencies` to run the database and `outpack_server`
2. `./api/scripts/run` to run the API
   i.If running basic auth mode, run `./scripts/basic-create-super-user`. This will create a superadmin user that can be used. Ensure api has ran and created all DB tables first.
3. `npm start --prefix=app` to run the React app on port 3000.

There are 3 subdirectories in this repo, each corresponding to a different service.
See individual READMEs for further details on developing each service.
`./scripts/clear-docker` is a useful command for reverting docker to a state without any of the containers, networks or volumes created by the services.

## Database

See [db/README.md](https://github.com/mrc-ide/packit/blob/main/db/README.md)

## API

See [api/README.md](https://github.com/mrc-ide/packit/blob/main/api/README.md)

## App

See [app/README.md](https://github.com/mrc-ide/packit/blob/main/app/README.md)

## Authentication in Packit

See [docs/auth.md](docs/auth.md)

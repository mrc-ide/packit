# packit

Web app for serving outpack and/or orderly2 metadata.

## Quick start
To run the whole app:
1. `./scripts/run-dependencies` to run the database and `outpack_server` 
2. `./api/scripts/run` to run the API
3. `npm start --prefix=app` to run the React app on port 3000.

There are 3 subdirectories in this repo, each corresponding to a different service. 
See individual READMEs for further details on developing each service.

## Database
See [db/README.md](https://github.com/mrc-ide/packit/blob/main/db/README.md)

## API
See [api/README.md](https://github.com/mrc-ide/packit/blob/main/api/README.md) 

## App
See [app/README.md](https://github.com/mrc-ide/packit/blob/main/app/README.md)

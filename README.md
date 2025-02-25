# packit

Web application for surfacing packet data and metadata. Packets are sets of files with related metadata conforming to the [outpack](https://github.com/mrc-ide/outpack/) format. Packets are produced as the result of running analysis scripts, typically using a package which supports outpack format, such as [orderly](https://github.com/mrc-ide/orderly2) or [pyorderly](https://github.com/mrc-ide/pyorderly), which also add their own custom metadata to the packets produced. 

Packet metadata includes:
- timestamp
- parameter
- display name
- file metadata e.g. whether a file is input ("resource") or output ("artefact")

Packet data are the files included in the packet, which can be downloaded through the application. 

The application can be used through the browser as a portal by researchers, to manage and track their packets, and by those who requested the analyses, to view packet outputs. Packets can also be created through the app by running an analysis. 

Packit can also be used programmatically through its `/outpack` route, which forwards requests to [outpack server](https://github.com/mrc-ide/outpack_server). 

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

## e2e Tests

We want to have e2e tests which test all packit features, but also to have a suite of tests which we can run against any
packit server to test that its deployment has succeeded. We therefore have two styles of e2e tests:
1. Generic tests which make no (or very few) assumptions about the packet groups, packets etc which will be present, and which 
can be run against any packet server. 
2. Tests which specifically expect the demo packet dataset, and therefore can test that packets have expected parameters, 
artefacts etc. These test are assumed to be running against localhost. 

To support running the correct tests for the target server, the playwright config file (`./app/playwright.config.ts`)
uses a different `testMatch` property depending on whether the base url for the Packit server starts with `http://localhost` - 
if so, files suffixed `local.ts` (and which provide the demo dataset tests) and also those suffixed `spec.ts`
(which provide generic test) will be matched and their tests run. If the base url is not for localhost, only the generic
tests will be matched and run. 

e2e test are currently all read-only. A feature to allow tests which change the state of the system for non-prod servers 
only will be added in a future branch. 

Playwright tests are in `./app/e2e`. By default, they will run against localhost, and expect basic auth super user to be
available, so for local dev you should run:
1.  `./scripts/dev-start --super-user` to start the dependencies, api and app
2. `npm run test:e2e` from `./app` 

Playwright tests can be run against any server by running `./scripts/run-e2e-tests-on-server` providing args for server url and auth method
("basic" or "github"), e.g. ` ./scripts/run-e2e-tests-on-server https://packit-dev.dide.ic.ac.uk/reside-dev/ github`.
The github auth part uses `pyorderly` and so if you want to use github auth, you will need to first be 
running in a context where pyorderly is available, e.g. by running:
```
hatch shell 
pip install pyorderly
```

NB If you're testing with a server url which is not a domain root, ensure that you append a "/". In this case it's also 
important to use `./` as the base route in the Playwright tests, not `/`.

The tests and test script use environment variables to set and determine test configuration values. These are:
`PACKIT_E2E_BASE_URL`, 
`PACKIT_E2E_AUTH_METHOD`,  
`PACKIT_E2E_BASIC_USER`, 
`PACKIT_E2E_BASIC_PASSWORD`, 
`PACKIT_E2E_GITHUB_TOKEN`


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

Developing packit requires Node 22 or above.

## Quick start

To run the whole app (default is github auth):

```
./scripts/dev-start
```

The app will be available on port 3000. If you would like to create a super admin user then:

```
./scripts/dev-start --super-user
```

You can run in preauth mode with the following. However, bear in mind that the front end will not be functional in this case - 
use the [Montagu proxy](https://github.com/vimc/montagu-proxy) for a working example with a separate auth provider. 
```
./scripts/dev-start --preauth
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

Playwright tests are in `./app/e2e`. There are three npm scripts defined in `app/package.json`:
- `test:e2e` - tests against `http://localhost:3000`. Can use either github or basic auth (assumes default superuser credentials).
- `test:e2e-dev` - tests against `https://reside-dev.packit-dev.dide.ic.ac.uk/` excluding demo dataset and state mutating tests
- `test:e2e-prod` - tests against `https://reside.packit.dide.ic.ac.uk/` excluding demo dataset and state mutating tests

To run any other variant, you can run `npx playwright test`, providing any required environment variables as detailed
below and `--grep` or `--grep-invert` arg to include or exclude tagged tests as required. 

The packit base url to use should be provided in the `PACKIT_E2E_BASE_URL` env var. If this is not set, playwright
will use `http://localhost:3000`. If you're testing with a base url which is not a domain root, ensure that you 
append a "/". In this case it's also important to use `./` as the base route in the Playwright tests, not `/`.


### Authentication
Authentication in the e2e tests is done in the setup project `auth.setup.ts` which is a dependency of all other projects
as defined in `playwright.config.ts`. We require the packit user who authenticates to have admin permissions. 

The setup project first checks the packit api's `/auth/config` endpoint to determine if basic or github auth is required. 

If basic auth, the env vars `PACKIT_E2E_BASIC_USER` and `PACKIT_E2E_BASIC_PASSOWRD` must be set. These will be used
to authenticate via the login page.

If github auth, the setup code checks for the optional `GITHUB_ACCESS_TOKEN`. If this is not set, it uses oauth device
flow to obtain a github token (this is an interactive process so we won't be able to use this on CI). The github token
is then posted to packit api's login endpoint to obtain a packit token, which is then passed to packit's redirect endpoint
login in the browser. 

For both auth methods, we then write out page context to a temporary location which is then picked up by dependent tests
so they start off in an authenticated state. 

### Tags

We want to have e2e tests which test all packit features, but also to have a suite of tests which we can run against any
packit server to test that its deployment has succeeded. In order to support detailed tests of all features, we want to 
have some tests which expect our standard demo dataset (available on localhost and perhaps on some dev instances), but
to exclude those tests when running generic tests on servers where demo packets are not present. 

We also want to have some tests which change the state of the server e.g. by running packets or changing user permissions. 
These should never be run on production servers. (We do not have any real tests of this type yet, but we have one tagged placeholder.)

We indicate these types of tests using tags:
- `@demoPackets` indicates that the test specifically expects the demo dataset.
- `@stateMutate` indicates that the test will change the server state

When running playwright, you can use `--grep` or `--grep-invert` to include or exclude particular tags. The npm 
scripts `test:e2e-dev` and `test:e2e-prod` use `--grep-invert '@demoPackets|@stateMutate'` to exclude these tags. 

As an additional guardrail, we want to make sure that `@stateMutate` tests are never run against production servers. For this
reason we have a custom test fixture `tagCheckFixture.ts` which all our e2e tests must use. It checks if any tests tagged
with `@stateMutate` are running when base url is not on `localhost` or `packit-dev.dide.ic.ac.uk`, and will throw an error
if that is the case. It will also warn if such tests are being run on dev, as this might be undesirable. It also warns
if `@demoPackets` tests are being run on non-localhost as this may explain any test failures. 

By custom, we suffix generic tests with `.generic.spec.ts` and demo datasets tests with `.demo.spec.ts`, but this 
naming convention is not interpreted by any test matchers or fixtures. 


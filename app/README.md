#Packit Front End
Interface is built with [React library](https://reactjs.org)

## Requirements

Node 22.

## Available Scripts

**App can be started in the project directory when you run:**

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console. \

To see a working app you will need to run dependencies. From the root directory:

1. ./scripts/run-dependencies
2. ./api/scripts/run OR ./api/gradlew -p api :app:bootRun

### `npm test`

Launches the test runner in the interactive watch mode. Excludes integration tests. \
See the section about [vitest features](https://vitest.dev/guide/features) for more information.

### `npm run test:coverage`

Launches the test runner in the interactive watch mode, running all tests and generating a coverage report.

### `npm run test:ui`

Launches [vitest ui](https://vitest.dev/guide/ui) in the browser, which allows you to run tests and see results in a UI.

### `npm run integration-test`

Launches the test runner in the interactive watch mode, running only integration tests. \
Dependencies must be running:

1. ./scripts/run-dependencies
2. ./api/scripts/run

### e2e tests

See overall project README.

### `npm run lint` or `npm run lint:fix`

Launches eslint, see [eslint](https://eslint.org/) for more information.

### `npm run format:check` or `npm run format:write`

Checks code formatting or formats code.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Building a docker image

The app is containerised into an image based on nginx. Note that in deployment this will be proxied, so no
security configuration is required here.

1. `./app/scripts/build` builds a docker image.
2. `./app/scripts/build-and-push` builds and pushes an image to dockerhub. This script is run on CI.
3. `./app/scripts/run` runs a built image with the current branch name.

### Mock Service Worker [MSW](https://mswjs.io/)

MSW is currently used to mock API calls in tests. It is configured in `src/setupTests.js`.
However, this can be used as a worker and be able to be if mocking of api is needed whilst development.
Eg. if the api is not ready but you want to test the front end with that contract.

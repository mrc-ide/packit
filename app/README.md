#Packit Front End
Interface is built with [React library](https://reactjs.org) 

## Requirements
Node 18.

## Available Scripts

**App can be started in the project directory when you run:**

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run lint` or `npm run lint:fix`

Launches eslint, see [eslint](https://eslint.org/) for more information.

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
3. `./app/scripts/run` runs a built image with the current branch name.****

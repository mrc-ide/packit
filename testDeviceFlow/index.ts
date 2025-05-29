import { input } from '@inquirer/prompts';

// TODO: read this from env var or prompt user
const PACKIT_API_URL="http://localhost:8080"

const makeDeviceAuthRequest = async() => {
    const response = await fetch(`${PACKIT_API_URL}/deviceAuth`, {
        method: "POST"
    });
    if (!response.ok) {
        throw Error(`Response ${response.status} when making device auth request`)
    }
    return await response.json();
}

const runFlow = async() => {
    console.log(`Making device flow request to Packit at: ${PACKIT_API_URL}`)
    const deviceRequestResponse = await makeDeviceAuthRequest();
    console.log(JSON.stringify(deviceRequestResponse));
}

runFlow();
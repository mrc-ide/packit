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
    return response;
}

const makeTokenRequest = async(device_code: string) => {
    const response = await fetch(`${PACKIT_API_URL}/deviceAuth/token`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ device_code, grant_type: "urn:ietf:params:oauth:grant-type:device_code" })
    });
    return response;
}

const runFlow = async() => {
    console.log(`Making device flow request to Packit at: ${PACKIT_API_URL}`)
    const deviceRequestResponse = await makeDeviceAuthRequest();

    if (deviceRequestResponse.status !== 200) {
        console.log(`Recieved error response ${deviceRequestResponse.status} from device flow request:`);
        console.log(await deviceRequestResponse.text())
        throw Error(`Device flow request failed`);
    }

    const { device_code, user_code, verification_uri, expires_in } = await deviceRequestResponse.json();
    console.log(`Browse to ${verification_uri} and enter code: ${user_code}`);
    console.log(`Code will expire in ${expires_in} seconds.`);

    const tokenResponse = await makeTokenRequest(device_code);
    console.log(`Token response ${tokenResponse.status}: `);
    const body = await tokenResponse.text()
    console.log(body)
}

runFlow();
import { input } from '@inquirer/prompts';

// TODO: read this from env var or prompt user
const PACKIT_API_URL="http://localhost:8080";
const GRANT_TYPE= "urn:ietf:params:oauth:grant-type:device_code";

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
        body: JSON.stringify({ device_code, grant_type: GRANT_TYPE })
    });
    return response;
}

const pollForToken = (device_code: string) => {
    setTimeout(async () => {
        const tokenResponse = await makeTokenRequest(device_code);
        const status = tokenResponse.status;
        const body = await tokenResponse.json();
        if (status == 200) {
            console.log("Token received:")
            console.log(JSON.stringify(body, null, 2));
        } else if (status == 400 && body.error.detail == "authorization_pending") {
            pollForToken(device_code);
        } else {
            console.log(`Unexpected error response ${status} from token request:`);
            console.log(JSON.stringify(body, null, 2));
        }
    }, 5000);
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

    console.log("Polling for token... (Press Ctrl-C to exit)");
    pollForToken(device_code);
}

runFlow();
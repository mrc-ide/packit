import * as readline from "readline/promises";

const GRANT_TYPE= "urn:ietf:params:oauth:grant-type:device_code";

let packitApiUrl = process.env.PACKIT_API_URL;

const promptForPackitApiUrl = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    packitApiUrl = await rl.question("Enter the Packit API url:");
    if (packitApiUrl.endsWith("/")) {
        packitApiUrl = packitApiUrl.substring(0, packitApiUrl.length-1)
    }
    rl.close();
}

const makeDeviceAuthRequest = async () => {
    const response = await fetch(`${packitApiUrl}/deviceAuth`, {
        method: "POST"
    });
    if (!response.ok) {
        throw Error(`Response ${response.status} when making device auth request`)
    }
    return response;
}

const makeTokenRequest = async (device_code: string) => {
    const response = await fetch(`${packitApiUrl}/deviceAuth/token`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ device_code, grant_type: GRANT_TYPE })
    });
    return response;
}

const testToken = async (access_token: string ) => {
    // Do some basic testing of the received token - check we can get a list of packet groups
    const response = await fetch(`${packitApiUrl}/packetGroupSummaries?pageNumber=0&pageSize=50&filter=`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${access_token}`
        }
    });
    if (!response.ok) {
        throw Error(`Response ${response.status} when testing access token`);
    }
    const data = await response.json();
    const packetGroupNames = data.content[0]?.map((pg) => pg.name);
    console.log("Used access token to successfully fetch first page of packet groups:")
    console.log(JSON.stringify(packetGroupNames));
}

const pollForToken = (device_code: string) => {
    setTimeout(async () => {
        const tokenResponse = await makeTokenRequest(device_code);
        const status = tokenResponse.status;
        const body = await tokenResponse.json();
        if (status == 200) {
            console.log("Token received:")
            console.log(JSON.stringify(body, null, 2));
            const { access_token } = body;
            await testToken(access_token);
        } else if (status == 400 && body.error.detail == "authorization_pending") {
            pollForToken(device_code);
        } else {
            console.log(`Unexpected error response ${status} from token request:`);
            console.log(JSON.stringify(body, null, 2));
        }
    }, 5000);
}

const runFlow = async() => {
    if (!packitApiUrl) {
        await promptForPackitApiUrl();
    }

    console.log(`Making device flow request to Packit at: ${packitApiUrl}`)
    const deviceRequestResponse = await makeDeviceAuthRequest();

    if (deviceRequestResponse.status !== 200) {
        console.log(`Received error response ${deviceRequestResponse.status} from device flow request:`);
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
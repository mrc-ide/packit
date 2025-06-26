"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require("readline/promises");
var undici_1 = require("undici");
var GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";
var packitApiUrl = process.env.PACKIT_API_URL;
// Allow self-signed certs
var agent = new undici_1.Agent({
    connect: {
        rejectUnauthorized: false
    }
});
(0, undici_1.setGlobalDispatcher)(agent);
var promptForPackitApiUrl = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                return [4 /*yield*/, rl.question("Enter the Packit API url:")];
            case 1:
                packitApiUrl = _a.sent();
                if (packitApiUrl.endsWith("/")) {
                    packitApiUrl = packitApiUrl.substring(0, packitApiUrl.length - 1);
                }
                rl.close();
                return [2 /*return*/];
        }
    });
}); };
var makeDeviceAuthRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("".concat(packitApiUrl, "/deviceAuth"), {
                    method: "POST"
                })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw Error("Response ".concat(response.status, " when making device auth request"));
                }
                return [2 /*return*/, response];
        }
    });
}); };
var makeTokenRequest = function (device_code) { return __awaiter(void 0, void 0, void 0, function () {
    var body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = "device_code=".concat(device_code, "&grant_type=").concat(GRANT_TYPE);
                return [4 /*yield*/, fetch("".concat(packitApiUrl, "/deviceAuth/token"), {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: body
                    })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var testToken = function (access_token) { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, packetGroupNames;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("".concat(packitApiUrl, "/packetGroupSummaries?pageNumber=0&pageSize=50&filter="), {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": "Bearer ".concat(access_token)
                    }
                })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw Error("Response ".concat(response.status, " when testing access token"));
                }
                return [4 /*yield*/, response.json()];
            case 2:
                data = _a.sent();
                packetGroupNames = data.content.map(function (pg) { return pg.name; });
                console.log("Used access token to successfully fetch first page of packet groups:");
                console.log(JSON.stringify(packetGroupNames));
                return [2 /*return*/];
        }
    });
}); };
var pollForToken = function (device_code) {
    setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
        var tokenResponse, status, body, access_token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeTokenRequest(device_code)];
                case 1:
                    tokenResponse = _a.sent();
                    status = tokenResponse.status;
                    return [4 /*yield*/, tokenResponse.json()];
                case 2:
                    body = _a.sent();
                    if (!(status == 200)) return [3 /*break*/, 4];
                    console.log("Token received:");
                    console.log(JSON.stringify(body, null, 2));
                    access_token = body.access_token;
                    return [4 /*yield*/, testToken(access_token)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    if (status == 400 && body.error == "authorization_pending") {
                        pollForToken(device_code);
                    }
                    else {
                        console.log("Unexpected error response ".concat(status, " from token request:"));
                        console.log(JSON.stringify(body, null, 2));
                    }
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); }, 5000);
};
var runFlow = function () { return __awaiter(void 0, void 0, void 0, function () {
    var deviceRequestResponse, _a, _b, _c, device_code, user_code, verification_uri, expires_in;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!!packitApiUrl) return [3 /*break*/, 2];
                return [4 /*yield*/, promptForPackitApiUrl()];
            case 1:
                _d.sent();
                _d.label = 2;
            case 2:
                console.log("Making device flow request to Packit at: ".concat(packitApiUrl));
                return [4 /*yield*/, makeDeviceAuthRequest()];
            case 3:
                deviceRequestResponse = _d.sent();
                if (!(deviceRequestResponse.status !== 200)) return [3 /*break*/, 5];
                console.log("Received error response ".concat(deviceRequestResponse.status, " from device flow request:"));
                _b = (_a = console).log;
                return [4 /*yield*/, deviceRequestResponse.text()];
            case 4:
                _b.apply(_a, [_d.sent()]);
                throw Error("Device flow request failed");
            case 5: return [4 /*yield*/, deviceRequestResponse.json()];
            case 6:
                _c = _d.sent(), device_code = _c.device_code, user_code = _c.user_code, verification_uri = _c.verification_uri, expires_in = _c.expires_in;
                console.log("Browse to ".concat(verification_uri, " and enter code: ").concat(user_code));
                console.log("Code will expire in ".concat(expires_in, " seconds."));
                console.log("Polling for token... (Press Ctrl-C to exit)");
                pollForToken(device_code);
                return [2 /*return*/];
        }
    });
}); };
runFlow();

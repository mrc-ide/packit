import appConfig from "../../config/appConfig";
import {http, HttpResponse} from "msw";

const downloadFileUri = `${appConfig.apiUrl()}/packets/file/sha:fakehash?filename=test.txt`;

export const downloadFileHandlers = [
    http.get(downloadFileUri, () => {
        return new HttpResponse(
            new Blob(["test contents"]),
        )
    })
];
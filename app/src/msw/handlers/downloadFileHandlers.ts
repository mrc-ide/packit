import appConfig from "../../config/appConfig";
import {rest} from "msw";
import {mockFileBlob} from "../../tests/mocks";

export const downloadFileUri = `${appConfig.apiUrl()}/packets/file/sha:fakehash`;

export const downloadFileHandlers = [
    rest.get(downloadFileUri, (req, res, ctx) => {
        return res(ctx.body(mockFileBlob));
    })
];
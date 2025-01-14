import appConfig from "../../config/appConfig";
import { rest } from "msw";
import { mockFileBlob } from "../../tests/mocks";

export const downloadFileUri = `${appConfig.apiUrl()}/packets/file/sha:fakehash`;

export const downloadFileHandlers = [
  rest.get(downloadFileUri, (req, res, ctx) => {
    // Return blob only with expected auth header
    if (req.headers.get("Authorization") === "fakeAuthHeader") {
      return res(ctx.body(mockFileBlob));
    } else {
      return res(ctx.status(401));
    }
  })
];

import appConfig from "../../config/appConfig";
import { rest } from "msw";
import { mockFileBlob, mockPacket } from "../../tests/mocks";

export const downloadFileHandlers = [
  rest.post(`${appConfig.apiUrl()}/packets/${mockPacket.id}/files/token`, (req, res, ctx) => {
    // Return token only with expected auth header
    if (req.headers.get("Authorization") === "fakeAuthHeader") {
      return res(ctx.json({ id: "fakeTokenId" }));
    } else {
      return res(ctx.status(401));
    }
  }),

  rest.get(`${appConfig.apiUrl()}/packets/${mockPacket.id}/files`, (req, res, ctx) => {
    return res(ctx.body(mockFileBlob));
  })
];

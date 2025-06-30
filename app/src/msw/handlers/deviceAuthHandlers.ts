import { rest } from "msw";
import appConfig from "../../config/appConfig";

export const deviceAuthHandlers = [
  rest.post(`${appConfig.apiUrl()}/deviceAuth/validate`, (req, res, ctx) => {
    return res(ctx.status(200));
  })
];

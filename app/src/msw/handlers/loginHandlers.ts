import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockToken } from "../../tests/mocks";

export const basicLoginUri = `${appConfig.apiUrl()}/auth/login/basic`;

export const loginHandlers = [
  rest.post(basicLoginUri, (req, res, ctx) => {
    return res(ctx.json({ token: mockToken }));
  })
];

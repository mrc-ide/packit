import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockUserState } from "../../tests/mocks";

export const basicLoginUri = `${appConfig.apiUrl()}/auth/login/basic`;

export const loginHandlers = [
  rest.post(basicLoginUri, (req, res, ctx) => {
    return res(ctx.json({ token: mockUserState.token }));
  })
];

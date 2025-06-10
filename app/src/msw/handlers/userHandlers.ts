import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockAuthorities } from "../../tests/mocks";

export const userIndexUri = `${appConfig.apiUrl()}/user`;

export const userHandlers = [
  rest.get(`${userIndexUri}/me/authorities`, (req, res, ctx) => {
    return res(ctx.json(mockAuthorities));
  })
];

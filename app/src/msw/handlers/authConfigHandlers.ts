import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockAuthConfig } from "../../tests/mocks";

console.log(`authConfigIndexUrl is ${appConfig.apiUrl()}`)
export const authConfigIndexUrl = `${appConfig.apiUrl()}/auth/config`;

export const authConfigHandlers = [
  rest.get(authConfigIndexUrl, (req, res, ctx) => {
    return res(ctx.json(mockAuthConfig));
  })
];

import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockLogoConfig } from "../../tests/mocks";

export const logoConfigUrl = `${appConfig.apiUrl()}/logo/config`;

export const brandLogoHandlers = [
  rest.get(logoConfigUrl, (req, res, ctx) => {
    return res(ctx.json(mockLogoConfig));
  })
];

import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockBrandingConfig } from "../../tests/mocks";

export const brandingConfigUrl = `${appConfig.apiUrl()}/branding/config`;

export const brandingHandlers = [
  rest.get(brandingConfigUrl, (req, res, ctx) => {
    return res(ctx.json(mockBrandingConfig));
  })
];

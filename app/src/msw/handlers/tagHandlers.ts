import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockTags } from "../../tests/mocks";

const tagIndexUri = `${appConfig.apiUrl()}/tag`;

export const tagHandlers = [
  rest.get(tagIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockTags));
  })
];

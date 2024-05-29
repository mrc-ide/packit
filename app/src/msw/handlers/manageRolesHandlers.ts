import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockNonUsernameRolesWithRelationships } from "../../tests/mocks";

export const manageRolesIndexUri = `${appConfig.apiUrl()}/role`;

export const manageRolesHandlers = [
  rest.get(manageRolesIndexUri, (req, res, ctx) => {
    req.url.searchParams.set("isUsername", "false");
    return res(ctx.json(mockNonUsernameRolesWithRelationships));
  })
];

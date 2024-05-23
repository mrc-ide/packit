import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockNonUsernameRolesWithRelationships, mockUsernameRolesWithRelationships } from "../../tests/mocks";

export const manageRolesIndexUri = `${appConfig.apiUrl()}/role`;

export const manageRolesHandlers = [
  rest.get(manageRolesIndexUri, (req, res, ctx) => {
    return res(ctx.json([...mockNonUsernameRolesWithRelationships, ...mockUsernameRolesWithRelationships]));
  })
];

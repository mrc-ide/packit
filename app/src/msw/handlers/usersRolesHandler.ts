import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockRolesAndUsersWithPermissions } from "../../tests/mocks";

export const usersRolesIndexUri = `${appConfig.apiUrl()}/user-role`;

export const usersRolesHandler = [
  rest.get(usersRolesIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockRolesAndUsersWithPermissions));
  })
];

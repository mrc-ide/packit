import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockUsers, mockRoles } from "../../tests/mocks";

export const usersIndexUri = `${appConfig.apiUrl()}/user`;
export const rolesIndexUri = `${appConfig.apiUrl()}/role`;
export const manageRolesHandlers = [
  rest.get(usersIndexUri, (req, res, ctx) => res(ctx.json(mockUsers))),
  rest.get(rolesIndexUri, (req, res, ctx) => res(ctx.json(mockRoles))),
];

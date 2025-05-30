import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacket, mockPacketGroupResponse, mockRolesAndUsersWithPermissions } from "../../tests/mocks";
// eslint-disable-next-line max-len
import { RolesAndUsersToUpdateRead } from "../../app/components/contents/manageAccess/types/RoleWithRelationships";

export const packetIndexUri = `${appConfig.apiUrl()}/packets`;

export const packetHandlers = [
  rest.get(`${packetIndexUri}`, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse));
  }),
  rest.get(`${packetIndexUri}/${mockPacket.id}`, (req, res, ctx) => {
    return res(ctx.json(mockPacket));
  }),
  rest.get(`${packetIndexUri}/${mockPacket.id}/read-permission`, (req, res, ctx) => {
    const rolesAndUsers: RolesAndUsersToUpdateRead = {
      withRead: mockRolesAndUsersWithPermissions,
      canRead: mockRolesAndUsersWithPermissions,
      cannotRead: mockRolesAndUsersWithPermissions
    };
    return res(ctx.json(rolesAndUsers));
  })
];

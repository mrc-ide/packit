import { rest } from "msw";
import appConfig from "../../config/appConfig";
import {
  mockBasicPackets,
  mockPacket,
  mockPacketGroupResponse,
  mockRolesAndUsersWithPermissions
} from "../../tests/mocks";
// eslint-disable-next-line max-len
import { RolesAndUsersToUpdateRead } from "../../app/components/contents/manageAccess/types/RoleWithRelationships";

export const packetIndexUri = `${appConfig.apiUrl()}/packets`;

export const packetHandlers = [
  rest.get(`${packetIndexUri}`, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse));
  }),
  rest.post(`${packetIndexUri}`, async (req, res, ctx) => {
    const body = await req.json();
    if (body.length > 0) {
      return res(ctx.json(mockBasicPackets));
    } else {
      return res(ctx.json([]));
    }
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

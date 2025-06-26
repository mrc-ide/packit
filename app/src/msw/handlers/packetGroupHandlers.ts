import { rest } from "msw";
import appConfig from "../../config/appConfig";
import {
  mockPacket,
  mockPacketGroupDtos,
  mockPacketGroupResponse,
  mockRolesAndUsersToUpdateRead
} from "../../tests/mocks";

const packetGroupIndexUri = `${appConfig.apiUrl()}/packetGroups`;

export const packetGroupHandlers = [
  rest.get(packetGroupIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupDtos));
  }),
  rest.get(`${packetGroupIndexUri}/${mockPacket.name}/display`, (req, res, ctx) => {
    return res(
      ctx.json({
        latestDisplayName: mockPacket.custom?.orderly.description.display,
        description: mockPacket.custom?.orderly.description.long
      })
    );
  }),
  rest.get(`${packetGroupIndexUri}/${mockPacketGroupResponse.content[0].name}/packets`, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse.content));
  }),
  rest.get(`${packetGroupIndexUri}/:name/read-permission`, (req, res, ctx) => {
    return res(ctx.json(mockRolesAndUsersToUpdateRead));
  })
];

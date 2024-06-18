import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacket, mockPacketGroupResponse } from "../../tests/mocks";

const packetIndexUri = `${appConfig.apiUrl()}/packets`;

export const packetHandlers = [
  rest.get(`${packetIndexUri}/metadata/${mockPacket.id}`, (req, res, ctx) => {
    return res(ctx.json(mockPacket));
  }),
  rest.get(`${packetIndexUri}/${mockPacketGroupResponse.content[0].name}`, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse));
  }),
  rest.get(`${packetIndexUri}`, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse));
  })
];

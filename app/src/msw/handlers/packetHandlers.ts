import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacket, mockPacketGroupResponse } from "../../tests/mocks";

const packetIndexUri = `${appConfig.apiUrl()}/packets`;

export const packetHandlers = [
  rest.get(`${packetIndexUri}`, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse));
  }),
  rest.get(`${packetIndexUri}/${mockPacket.id}`, (req, res, ctx) => {
    return res(ctx.json(mockPacket));
  })
];

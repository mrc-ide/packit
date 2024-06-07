import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroupDtos, mockPacketGroupResponse } from "../../tests/mocks";

const packetIndexUri = `${appConfig.apiUrl()}/packets`;

export const packetGroupHandlers = [
  rest.get(`${packetIndexUri}/${mockPacketGroupResponse.content[0].name}`, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse));
  }),
  rest.get(`${packetIndexUri}/packetGroup`, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupDtos));
  }),
  rest.get(`${packetIndexUri}`, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse));
  })
];

import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroupResponse } from "../../tests/mocks";

const packetGroupIndexUri = `${appConfig.apiUrl()}/packets/${mockPacketGroupResponse.content[0].name}`;

export const packetGroupHandlers = [
  rest.get(packetGroupIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse));
  })
];

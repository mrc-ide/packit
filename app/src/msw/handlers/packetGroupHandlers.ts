import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroupResponse } from "../../tests/mocks";

const packetGroupSummaryIndexUri = `${appConfig.apiUrl()}/packets/${mockPacketGroupResponse.content[0].name}`;

export const packetGroupHandlers = [
  rest.get(packetGroupSummaryIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupResponse));
  })
];

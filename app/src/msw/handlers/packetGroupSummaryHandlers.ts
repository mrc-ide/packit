import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroupSummary } from "../../tests/mocks";

const packetGroupSummaryIndexUri = `${appConfig.apiUrl()}/packets/packetGroupSummary`;

export const packetGroupSummaryHandlers = [
  rest.get(packetGroupSummaryIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupSummary));
  })
];

import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroupSummary } from "../../tests/mocks";

const packetGroupIndexUri = `${appConfig.apiUrl()}/packets/packetGroupSummary`;

export const packetGroupHandlers = [
  rest.get(packetGroupIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupSummary));
  })
];

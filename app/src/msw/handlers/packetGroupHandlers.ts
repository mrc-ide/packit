import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroupDtos } from "../../tests/mocks";

const packetGroupIndexUri = `${appConfig.apiUrl()}/packetGroup`;

export const packetGroupHandlers = [
  rest.get(packetGroupIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupDtos));
  })
];

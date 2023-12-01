import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroups } from "../../tests/mocks";

const packetGroupIndexUri = `${appConfig.apiUrl()}/packets/overview`;

export const packetGroupHandlers = [
  rest.get(packetGroupIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroups));
  })
];

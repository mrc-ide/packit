import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacket } from "../../tests/mocks";

const packetIndexUri = `${appConfig.apiUrl()}/packets/metadata/${mockPacket.id}`;

export const packetHandlers = [
  rest.get(packetIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacket));
  })
];

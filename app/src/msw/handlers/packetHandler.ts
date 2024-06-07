import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacket } from "../../tests/mocks";

const specificPacketIndexUri = `${appConfig.apiUrl()}/packets/metadata/${mockPacket.id}`;

export const packetHandlers = [
  rest.get(specificPacketIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacket));
  })
];

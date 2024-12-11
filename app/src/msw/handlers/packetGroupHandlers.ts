import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacket, mockPacketGroupDtos } from "../../tests/mocks";

const packetGroupIndexUri = `${appConfig.apiUrl()}/packetGroups`;

export const packetGroupHandlers = [
  rest.get(packetGroupIndexUri, (req, res, ctx) => {
    return res(ctx.json(mockPacketGroupDtos));
  }),
  rest.get(`${packetGroupIndexUri}/${mockPacket.name}/detail`, (req, res, ctx) => {
    return res(ctx.json({
      latestPacketId: mockPacket.id,
      displayName: mockPacket.custom?.orderly.description.display,
      packetDescription: mockPacket.custom?.orderly.description.long
    }));
  })
];

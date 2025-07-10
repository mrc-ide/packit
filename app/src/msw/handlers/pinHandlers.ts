import { rest } from "msw";
import appConfig from "@/config/appConfig";
import { mockPacket, mockPacket2 } from "@/tests/mocks";
import { HttpStatus } from "@lib/types/HttpStatus";

export const pinHandlers = [
  rest.get(`${appConfig.apiUrl()}/pins/packets`, (req, res, ctx) => {
    return res(ctx.json([mockPacket]));
  }),
  rest.post(`${appConfig.apiUrl()}/pins`, async (req, res, ctx) => {
    const body = await req.json();

    if (body.packetId === mockPacket.id) {
      return res(ctx.status(HttpStatus.BadRequest), ctx.json({ error: { detail: "Pin already exists" } }));
    } else if (body.packetId === mockPacket2.id) {
      return res(ctx.status(HttpStatus.Created), ctx.json({ packetId: mockPacket2.id }));
    } else {
      return res(ctx.status(HttpStatus.NotFound), ctx.json({ error: { detail: "Packet not found" } }));
    }
  }),
  rest.delete(`${appConfig.apiUrl()}/pins`, async (req, res, ctx) => {
    const body = await req.json();

    if (body.packetId === mockPacket.id) {
      console.error("doing delete handler")
      return res(ctx.status(HttpStatus.NoContent));
    }
  }),
];

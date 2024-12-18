import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroupSummaries, mockPacketGroupDisplaysFiltered } from "../../tests/mocks";

export const packetGroupSummaryHandlers = [
  rest.get(`${appConfig.apiUrl()}/packets/packetGroupSummaries`, (req, res, ctx) => {
    const url = new URL(req.url);
    if (url.searchParams.get("filterName")) {
      return res(ctx.json(mockPacketGroupDisplaysFiltered));
    }

    return res(ctx.json(mockPacketGroupSummaries));
  })
];

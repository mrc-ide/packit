import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroupSummaries, mockPacketGroupSummariesFiltered } from "../../tests/mocks";

export const packetGroupSummaryHandlers = [
  rest.get(`${appConfig.apiUrl()}/packetGroupSummaries`, (req, res, ctx) => {
    const url = new URL(req.url);
    if (url.searchParams.get("filterName")) {
      return res(ctx.json(mockPacketGroupSummariesFiltered));
    }

    return res(ctx.json(mockPacketGroupSummaries));
  })
];

import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockPacketGroupSummaries, mockPacketGroupSummariesFiltered } from "../../tests/mocks";

const packetGroupSummaryIndexUri = `${appConfig.apiUrl()}/packets/packetGroupSummaries`;

export const packetGroupSummaryHandlers = [
  rest.get(packetGroupSummaryIndexUri, (req, res, ctx) => {
    const url = new URL(req.url)
    if (url.searchParams.get("filterName")) {
      return res(ctx.json(mockPacketGroupSummariesFiltered))
    }

    return res(ctx.json(mockPacketGroupSummaries));
  })
];

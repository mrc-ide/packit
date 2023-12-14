import { rest } from "msw";
import { packetGroupSummaryHandlers } from "./handlers/packetGroupSummaryHandlers";
import { packetGroupHandlers } from "./handlers/packetGroupHandlers";

// catch any missed requests in tests
const defaultHandlers = [
  rest.get("*", (req, res, ctx) => res(ctx.status(200))),
  rest.post("*", (req, res, ctx) => res(ctx.status(201))),
  rest.patch("*", (req, res, ctx) => res(ctx.status(204))),
  rest.delete("*", (req, res, ctx) => res(ctx.status(204)))
];

export const handlers = [...packetGroupSummaryHandlers, ...packetGroupHandlers, ...defaultHandlers];

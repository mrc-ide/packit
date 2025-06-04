import { rest } from "msw";
import { authConfigHandlers } from "./handlers/authConfigHandlers";
import { downloadFileHandlers } from "./handlers/downloadFileHandlers";
import { packetGroupHandlers } from "./handlers/packetGroupHandlers";
import { packetGroupSummaryHandlers } from "./handlers/packetGroupSummaryHandlers";
import { packetHandlers } from "./handlers/packetHandlers";
import { loginHandlers } from "./handlers/loginHandlers";
import { manageRolesHandlers } from "./handlers/manageRolesHandlers";
import { tagHandlers } from "./handlers/tagHandler";
import { runnerHandlers } from "./handlers/runnerHandlers";
import { brandLogoHandlers } from "./handlers/brandLogoHandlers";
import { usersRolesHandler } from "./handlers/usersRolesHandler";
import { userHandlers } from "./handlers/userHandlers";

// catch any missed requests in tests
const defaultHandlers = [
  rest.get("*", (req, res, ctx) => res(ctx.status(200))),
  rest.post("*", (req, res, ctx) => res(ctx.status(201))),
  rest.patch("*", (req, res, ctx) => res(ctx.status(204))),
  rest.delete("*", (req, res, ctx) => res(ctx.status(204)))
];

export const handlers = [
  ...authConfigHandlers,
  ...brandLogoHandlers,
  ...downloadFileHandlers,
  ...loginHandlers,
  ...manageRolesHandlers,
  ...runnerHandlers,
  ...packetGroupSummaryHandlers,
  ...packetGroupHandlers,
  ...packetHandlers,
  ...tagHandlers,
  ...userHandlers,
  ...usersRolesHandler,
  ...defaultHandlers
];

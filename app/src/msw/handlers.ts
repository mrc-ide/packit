import { rest } from "msw";
import { authConfigHandlers } from "./handlers/authConfigHandlers";
import { brandingHandlers } from "./handlers/brandingHandlers";
import { downloadFileHandlers } from "./handlers/downloadFileHandlers";
import { loginHandlers } from "./handlers/loginHandlers";
import { manageRolesHandlers } from "./handlers/manageRolesHandlers";
import { packetGroupHandlers } from "./handlers/packetGroupHandlers";
import { packetGroupSummaryHandlers } from "./handlers/packetGroupSummaryHandlers";
import { packetHandlers } from "./handlers/packetHandlers";
import { pinHandlers } from "./handlers/pinHandlers";
import { tagHandlers } from "./handlers/tagHandlers";
import { runnerHandlers } from "./handlers/runnerHandlers";
import { usersRolesHandler } from "./handlers/usersRolesHandler";
import { userHandlers } from "./handlers/userHandlers";
import { deviceAuthHandlers } from "./handlers/deviceAuthHandlers";

// catch any missed requests in tests
const defaultHandlers = [
  rest.get("*", (_req, res, ctx) => res(ctx.status(200))),
  rest.post("*", (_req, res, ctx) => res(ctx.status(201))),
  rest.patch("*", (_req, res, ctx) => res(ctx.status(204))),
  rest.delete("*", (_req, res, ctx) => res(ctx.status(204)))
];

export const handlers = [
  ...authConfigHandlers,
  ...brandingHandlers,
  ...downloadFileHandlers,
  ...loginHandlers,
  ...manageRolesHandlers,
  ...runnerHandlers,
  ...packetGroupSummaryHandlers,
  ...packetGroupHandlers,
  ...packetHandlers,
  ...pinHandlers,
  ...tagHandlers,
  ...userHandlers,
  ...usersRolesHandler,
  ...deviceAuthHandlers,
  ...defaultHandlers
];

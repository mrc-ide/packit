import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockGitBranches, mockPacketGroupsParameters, mockRunnerPacketGroups, mockTaskId } from "../../tests/mocks";

export const basicRunnerUri = `${appConfig.apiUrl()}/runner`;
export const runnerHandlers = [
  rest.get(`${basicRunnerUri}/git/branches`, (req, res, ctx) => {
    return res(ctx.json(mockGitBranches));
  }),
  rest.get(`${basicRunnerUri}/packetGroups`, (req, res, ctx) => {
    return res(ctx.json(mockRunnerPacketGroups));
  }),
  rest.get(`${basicRunnerUri}/:packetGroupName/parameters`, (req, res, ctx) => {
    const { packetGroupName } = req.params as { packetGroupName: string };
    return res(ctx.json(mockPacketGroupsParameters[packetGroupName]));
  }),
  rest.post(`${basicRunnerUri}/run`, (req, res, ctx) => {
    return res(ctx.json({ taskId: mockTaskId }));
  })
];

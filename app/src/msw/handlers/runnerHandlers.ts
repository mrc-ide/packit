import { rest } from "msw";
import appConfig from "../../config/appConfig";
import {
  mockCompleteRunInfo,
  mockGitBranches,
  mockPacketGroupsParameters,
  mockRunnerPacketGroups,
  mockTaskId,
  mockTasksRunInfo
} from "../../tests/mocks";

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
  }),
  rest.get(`${basicRunnerUri}/status/:taskId`, (req, res, ctx) => {
    return res(ctx.json(mockCompleteRunInfo));
  }),
  rest.get(`${basicRunnerUri}/list/status`, (req, res, ctx) => {
    return res(ctx.json(mockTasksRunInfo));
  }),
  rest.get(`${basicRunnerUri}/packet/:packetId/task`, (req, res, ctx) => {
    return res(ctx.json({ runTaskId: mockTaskId }));
  })
];

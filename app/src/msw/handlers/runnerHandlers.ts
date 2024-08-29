import { rest } from "msw";
import appConfig from "../../config/appConfig";
import { mockGitBranches } from "../../tests/mocks";

export const basicRunnerUri = `${appConfig.apiUrl()}/runner`;
export const runnerHandlers = [
  rest.get(`${basicRunnerUri}/git/branches`, (req, res, ctx) => {
    return res(ctx.json(mockGitBranches));
  })
];

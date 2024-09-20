import { render, screen, waitFor } from "@testing-library/react";
import { PacketRunTasksLogs } from "../../../../app/components/contents/runner";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import { mockTasksRunInfo } from "../../../mocks";
import { basicRunnerUri } from "../../../../msw/handlers/runnerHandlers";
import { SWRConfig } from "swr";

describe("PacketRunTasksLogs component", () => {
  it("renders reset button when filter is being filled and & calls api 2 time", async () => {
    let numApiCalled = 0;
    server.use(
      rest.get(`${basicRunnerUri}/list/status`, (req, res, ctx) => {
        numApiCalled++;
        return res(ctx.json(mockTasksRunInfo));
      })
    );
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter>
          <PacketRunTasksLogs />
        </MemoryRouter>
      </SWRConfig>
    );

    await screen.findByText("Git Info");

    const filterInput = screen.getByPlaceholderText("filter packet group names...");
    userEvent.type(filterInput, "testName");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeVisible();
      expect(numApiCalled).toBe(2);
    });
  });
});

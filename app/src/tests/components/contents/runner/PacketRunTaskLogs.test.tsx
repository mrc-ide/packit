import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PacketRunTaskLogs } from "../../../../app/components/contents/runner/PacketRunTaskLogs";
import { mockCompleteRunInfo } from "../../../mocks";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import { SWRConfig } from "swr";

describe("PacketRunTaskLogs", () => {
  const testTaskId = "1234";
  const renderComponent = () => {
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        <MemoryRouter initialEntries={[`/runner/logs/${testTaskId}`]}>
          <Routes>
            <Route path="/runner/logs/:taskId" element={<PacketRunTaskLogs />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("should render runInfo if successfully gets status", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(testTaskId, { exact: false })).toBeVisible();
    });
    expect(screen.getByText(mockCompleteRunInfo.branch)).toBeVisible();
    mockCompleteRunInfo.logs?.forEach((log) => {
      expect(screen.getByText(log)).toBeVisible();
    });
  });

  it("should render error component with error message if fails fetching status", async () => {
    const errorMessage = "test error message";
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ error: { detail: errorMessage } }));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeVisible();
    });
  });
});

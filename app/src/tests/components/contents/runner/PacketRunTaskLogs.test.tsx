import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PacketRunTaskLogs } from "../../../../app/components/contents/runner/PacketRunTaskLogs";
import { mockCompleteRunInfo } from "../../../mocks";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import { SWRConfig } from "swr";
import { basicRunnerUri } from "../../../../msw/handlers/runnerHandlers";
import { vi } from "vitest";

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
  const awaitTaskId = async () => {
    await waitFor(() => {
      expect(screen.getByText(testTaskId, { exact: false })).toBeVisible();
    });
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render runInfo if successfully gets status", async () => {
    renderComponent();

    await awaitTaskId();
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

  it("should poll api & update time if status is RUNNING", async () => {
    let numApiCalled = 0;
    const timeStarted = Date.now() / 1000;
    server.use(
      rest.get(`${basicRunnerUri}/status/:taskId`, (req, res, ctx) => {
        numApiCalled++;
        return res(ctx.json({ ...mockCompleteRunInfo, status: "RUNNING", timeStarted }));
      })
    );
    renderComponent();
    vi.useFakeTimers();

    await waitFor(() => {
      expect(screen.getByText(/Running for 1 s/i)).toBeVisible();
    });

    vi.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText(/Running for 3 s/i)).toBeVisible();
    });

    vi.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText(/Running for 5 s/i)).toBeVisible();
    });
    expect(numApiCalled).toBe(3);
  });

  it("should  poll api & update time if status is PENDING", async () => {
    let numApiCalled = 0;
    const timeQueued = Date.now() / 1000;
    server.use(
      rest.get(`${basicRunnerUri}/status/:taskId`, (req, res, ctx) => {
        numApiCalled++;
        return res(ctx.json({ ...mockCompleteRunInfo, status: "PENDING", timeQueued }));
      })
    );
    renderComponent();
    vi.useFakeTimers();

    await waitFor(() => {
      expect(screen.getByText(/Waiting for 1 s/i)).toBeVisible();
    });

    vi.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText(/Waiting for 3 s/i)).toBeVisible();
    });

    vi.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText(/Waiting for 5 s/i)).toBeVisible();
    });
    expect(numApiCalled).toBe(3);
  });

  it("should not poll api if status is not RUNNING OR PENDING", async () => {
    let numApiCalled = 0;
    server.use(
      rest.get(`${basicRunnerUri}/status/:taskId`, (req, res, ctx) => {
        numApiCalled++;
        return res(ctx.json(mockCompleteRunInfo));
      })
    );
    renderComponent();
    vi.useFakeTimers();

    await awaitTaskId();

    vi.advanceTimersByTime(2000);
    await awaitTaskId();

    vi.advanceTimersByTime(2000);
    await awaitTaskId();

    await waitFor(() => {
      expect(numApiCalled).toBe(1);
    });
  });
});

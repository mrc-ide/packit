import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";
import { TasksLogsTable } from "@components/contents/runner/logs/TasksLogsTable";
import { PAGE_SIZE } from "@lib/constants";
import { basicRunnerUri } from "@/msw/handlers/runnerHandlers";
import { server } from "@/msw/server";
import { mockTasksRunInfo } from "@/tests/mocks";
const renderComponent = () =>
  render(
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <MemoryRouter>
        <TasksLogsTable pageNumber={1} pageSize={PAGE_SIZE} filterPacketGroupName="" setPageNumber={vitest.fn()} />
        <Toaster />
      </MemoryRouter>
    </SWRConfig>
  );

describe("TasksLogsTable component", () => {
  afterEach(() => {
    vitest.useRealTimers();
  });
  it("should render error component when api call fails", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Error fetching tasks logs/i)).toBeVisible();
    });
  });

  it("should render correct icons for table", async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      expect(container.querySelector(".lucide-check.h-4.w-4.stroke-2")).toBeVisible();
    });
    expect(container.querySelector(".lucide-x.h-4.w-4.stroke-2")).toBeVisible();
    expect(container.querySelector(".lucide-ellipsis.h-4.w-4.stroke-2")).toBeVisible();
    expect(container.querySelector(".lucide-loader-circle.h-4.w-4.stroke-2")).toBeVisible();
    // loader wrapper
    expect(container.querySelector(".h-7.w-7")).toBeVisible();
  });

  it("should render link with packet id for complete status row", async () => {
    const completeTaskRun = { ...mockTasksRunInfo.content[0] };
    renderComponent();

    const packetIdLink = (await screen.findAllByRole("link"))[1];

    expect(packetIdLink).toHaveAttribute("href", `/${completeTaskRun.packetGroupName}/${completeTaskRun.packetId}`);
  });

  it("should render packetGroupName links to task logs", async () => {
    renderComponent();

    await waitFor(() => {
      mockTasksRunInfo.content.forEach((taskRun) => {
        expect(screen.getByRole("link", { name: taskRun.packetGroupName })).toHaveAttribute(
          "href",
          `/${taskRun.taskId}`
        );
      });
    });
  });

  it("should render user and git info and time queued", async () => {
    renderComponent();

    await waitFor(() => {
      mockTasksRunInfo.content.forEach((taskRun) => {
        expect(screen.getByText(taskRun.runBy)).toBeVisible();
        expect(screen.getByText(taskRun.branch)).toBeVisible();
        expect(screen.getByText(taskRun.commitHash.slice(0, 7))).toBeVisible();
      });
    });
    expect(screen.getAllByText((content) => content.startsWith("Created"))).toHaveLength(
      mockTasksRunInfo.content.length
    );
  });

  it("renders parameters when available and none otherwise", async () => {
    const firstTaskParameters = mockTasksRunInfo.content[0].parameters as Record<string, string>;
    renderComponent();

    const noneParameters = await screen.findAllByText(/None/i);
    expect(noneParameters).toHaveLength(mockTasksRunInfo.content.length - 1);
    await waitFor(() => {
      Object.entries(firstTaskParameters).forEach(([key, val]) => {
        expect(screen.getByText(`${key}:`)).toBeVisible();
        expect(screen.getByText(`${val}`)).toBeVisible();
      });
    });
  });

  it("should poll api every 3 seconds & update created at time if any status is running or pending", async () => {
    let numApiCalled = 0;
    const timeStarted = Date.now() / 1000;
    const pendingRunInfo = { ...mockTasksRunInfo.content[2], timeQueued: timeStarted };

    server.use(
      rest.get(`${basicRunnerUri}/list/status`, (req, res, ctx) => {
        numApiCalled++;
        return res(ctx.json({ ...mockTasksRunInfo, content: [mockTasksRunInfo.content[0], pendingRunInfo] }));
      })
    );
    renderComponent();
    vitest.useFakeTimers();

    await waitFor(() => {
      expect(screen.getByText(/created 1 seconds ago/i)).toBeVisible();
    });

    vitest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(screen.getByText(/created 4 seconds ago/i)).toBeVisible();
    });

    vitest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText(/created 7 seconds ago/i)).toBeVisible();
      expect(numApiCalled).toBe(3);
    });
  });

  it("should not poll api if all task are completed", async () => {
    let numApiCalled = 0;
    const timeStarted = Date.now() / 1000;
    const completedRunInfo = { ...mockTasksRunInfo.content[0], timeQueued: timeStarted };

    server.use(
      rest.get(`${basicRunnerUri}/list/status`, (req, res, ctx) => {
        numApiCalled++;
        return res(ctx.json({ ...mockTasksRunInfo, content: [completedRunInfo] }));
      })
    );
    renderComponent();
    vitest.useFakeTimers();

    vitest.advanceTimersByTime(3000);
    vitest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(numApiCalled).toBe(1);
    });
  });

  it("should allow cancel task when status is running, pending or deferred", async () => {
    let cancelCalled = false;
    server.use(
      rest.post(`${basicRunnerUri}/cancel/:taskId`, (req, res, ctx) => {
        cancelCalled = true;

        expect(req.params.taskId).toBe(mockTasksRunInfo.content[2].taskId);
        return res(ctx.status(204));
      })
    );

    renderComponent();

    const cancelButtons = await screen.findAllByRole("button", { name: /cancel/i });
    expect(cancelButtons).toHaveLength(2); // 2 tasks are running or pending

    userEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(cancelCalled).toBe(true);
      expect(cancelButtons[0]).toBeDisabled();
    });
  });

  it("should show error toast & re-enable cancel button on cancel fail", async () => {
    server.use(
      rest.post(`${basicRunnerUri}/cancel/:taskId`, (req, res, ctx) => {
        expect(req.params.taskId).toBe(mockTasksRunInfo.content[2].taskId);
        return res(ctx.status(500));
      })
    );

    renderComponent();

    const cancelButtons = await screen.findAllByRole("button", { name: /cancel/i });
    userEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/failed to cancel task/i)).toBeVisible();
      expect(cancelButtons[0]).toBeEnabled();
    });
  });
});

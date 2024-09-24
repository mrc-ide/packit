import { render, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter } from "react-router-dom";
import { SWRConfig } from "swr";
import { TasksLogsTable } from "../../../../../app/components/contents/runner/logs/TasksLogsTable";
import { PAGE_SIZE } from "../../../../../lib/constants";
import { server } from "../../../../../msw/server";
import { mockTasksRunInfo } from "../../../../mocks";
import { basicRunnerUri } from "../../../../../msw/handlers/runnerHandlers";

const renderComponent = () =>
  render(
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <MemoryRouter>
        <TasksLogsTable pageNumber={1} pageSize={PAGE_SIZE} filterPacketGroupName="" setPageNumber={jest.fn()} />
      </MemoryRouter>
    </SWRConfig>
  );

describe("TasksLogsTable component", () => {
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
        expect(screen.getByText(taskRun.ranBy)).toBeVisible();
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
    // screen.debug(undefined, 300000);
    await waitFor(() => {
      Object.entries(firstTaskParameters).forEach(([key, val]) => {
        expect(screen.getByText(`${key}:`)).toBeVisible();
        expect(screen.getByText(`${val}`)).toBeVisible();
      });
    });
  });

  it("should poll api every 3 seconds & update created at time", async () => {
    let numApiCalled = 0;
    const timeStarted = Date.now() / 1000;
    const firstRunInfoClone = { ...mockTasksRunInfo.content[0], timeQueued: timeStarted };

    server.use(
      rest.get(`${basicRunnerUri}/list/status`, (req, res, ctx) => {
        numApiCalled++;
        return res(ctx.json({ ...mockTasksRunInfo, content: [firstRunInfoClone] }));
      })
    );
    jest.useFakeTimers();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/created 1 seconds ago/i)).toBeVisible();
    });

    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(screen.getByText(/created 4 seconds ago/i)).toBeVisible();
    });

    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(screen.getByText(/created 7 seconds ago/i)).toBeVisible();
    });
    expect(numApiCalled).toBe(3);
  });
});

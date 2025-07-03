import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TaskRunSummary } from "@components/contents/runner/logs/TaskRunSummary";
import { mockCompleteRunInfo } from "@/tests/mocks";
import userEvent from "@testing-library/user-event";
import { server } from "@/msw/server";
import { rest } from "msw";
import { Toaster } from "sonner";

describe("TaskRunSummary component", () => {
  it("should render summary information for task run", async () => {
    const { container } = render(
      <MemoryRouter>
        <TaskRunSummary runInfo={mockCompleteRunInfo} />
      </MemoryRouter>
    );

    expect(screen.getByText(mockCompleteRunInfo.taskId)).toBeVisible();
    expect(screen.getByText(mockCompleteRunInfo.packetGroupName)).toBeVisible();
    expect(screen.getByText(/Ran in 1 m 11 s/i)).toBeVisible();

    expect(screen.getByText(mockCompleteRunInfo.branch)).toBeVisible();
    expect(
      screen.getByText("Created at " + new Date((mockCompleteRunInfo.timeQueued as number) * 1000).toLocaleString())
    ).toBeVisible();
    expect(
      screen.getByText("Started at " + new Date((mockCompleteRunInfo.timeStarted as number) * 1000).toLocaleString())
    ).toBeVisible();
    expect(
      screen.getByText("Finished at " + new Date((mockCompleteRunInfo.timeCompleted as number) * 1000).toLocaleString())
    ).toBeVisible();
    expect(screen.getByText(`Run by ${mockCompleteRunInfo.runBy}`)).toBeVisible();
    expect(screen.getByText(mockCompleteRunInfo.commitHash.slice(0, 7))).toBeVisible();
    Object.entries(mockCompleteRunInfo.parameters as Record<string, string>).forEach(([key, value]) => {
      expect(screen.getByText(`${key}:`)).toBeVisible();
      expect(screen.getByText(value)).toBeVisible();
    });
    const packetIdLink = screen.getByRole("link", { name: /view/i });
    expect(packetIdLink).toBeVisible();
    expect(packetIdLink).toHaveAttribute(
      "href",
      `/${mockCompleteRunInfo.packetGroupName}/${mockCompleteRunInfo.packetId}`
    );
    expect(container.querySelector(".lucide-check") as Element).toBeVisible();
  });

  it("should render parameters as None if no parameters are provided", async () => {
    render(
      <MemoryRouter>
        <TaskRunSummary runInfo={{ ...mockCompleteRunInfo, parameters: undefined }} />
      </MemoryRouter>
    );

    expect(screen.getByText("Parameters: None")).toBeVisible();
  });

  it("should not render packetId link if packetId is not provided", async () => {
    render(
      <MemoryRouter>
        <TaskRunSummary runInfo={{ ...mockCompleteRunInfo, packetId: undefined }} />
      </MemoryRouter>
    );

    expect(screen.queryByRole("link", { name: /view/i })).not.toBeInTheDocument();
  });

  it("should loader spinner when cancel task is called", async () => {
    render(
      <MemoryRouter>
        <TaskRunSummary runInfo={{ ...mockCompleteRunInfo, packetId: undefined, status: "RUNNING" }} />
      </MemoryRouter>
    );

    const cancelButton = screen.getByRole("button", { name: /cancel task/i });
    userEvent.click(cancelButton);

    await waitFor(() => {
      expect(cancelButton).toBeDisabled();
      expect(cancelButton.querySelector(".lucide-loader-circle.animate-spin")).toBeInTheDocument();
    });
  });

  it("should show error toast when cancel task fails", async () => {
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    render(
      <MemoryRouter>
        <TaskRunSummary runInfo={{ ...mockCompleteRunInfo, packetId: undefined, status: "RUNNING" }} />
        <Toaster />
      </MemoryRouter>
    );

    const cancelButton = screen.getByRole("button", { name: /cancel task/i });
    userEvent.click(cancelButton);

    await waitFor(() => {
      // get first as test may render multiple toasts
      expect(screen.getAllByText(/failed to cancel task/i)[0]).toBeVisible();
    });
    expect(cancelButton).not.toBeDisabled();
    expect(cancelButton.querySelector(".lucide-loader-circle.animate-spin")).not.toBeInTheDocument();
  });
});

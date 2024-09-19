import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TaskRunSummary } from "../../../../../app/components/contents/runner/logs/TaskRunSummary";
import { mockCompleteRunInfo } from "../../../../mocks";

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
      screen.getByText("Started " + new Date((mockCompleteRunInfo.timeStarted as number) * 1000).toLocaleString())
    ).toBeVisible();
    expect(screen.getByText(`Ran by ${mockCompleteRunInfo.ranBy}`)).toBeVisible();
    expect(screen.getByText(mockCompleteRunInfo.commitHash.slice(0, 7))).toBeVisible();
    Object.entries(mockCompleteRunInfo.parameters as Record<string, string>).forEach(([key, value]) => {
      expect(screen.getByText(`${key}:`)).toBeVisible();
      expect(screen.getByText(value)).toBeVisible();
    });
    const packetIdLink = screen.getByRole("link", { name: "View" });
    expect(packetIdLink).toBeVisible();
    expect(packetIdLink).toHaveAttribute(
      "href",
      `/${mockCompleteRunInfo.packetGroupName}/${mockCompleteRunInfo.packetId}`
    );
    expect(container.querySelector(".lucide-circle-check") as Element).toBeVisible();
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

    expect(screen.queryByRole("link", { name: "View" })).not.toBeInTheDocument();
  });
});

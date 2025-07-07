import { render, screen } from "@testing-library/react";
import { TaskRunLogs } from "@components/contents/runner/logs/TaskRunLogs";

describe("TaskRunLogs component", () => {
  it("should render logs if logs are provided", async () => {
    const logs = ["log1", "log2", "log3"];
    render(<TaskRunLogs logs={logs} />);

    expect(screen.getByRole("heading", { name: "Logs" })).toBeVisible();
    logs.forEach((log) => {
      expect(screen.getByText(log)).toBeVisible();
    });
  });

  it("should render no logs message if logs are not provided", async () => {
    render(<TaskRunLogs logs={null} />);

    expect(screen.getByText("No logs available yet...")).toBeVisible();
  });
});

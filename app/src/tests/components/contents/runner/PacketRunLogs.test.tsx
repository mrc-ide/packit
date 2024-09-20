import { render, screen } from "@testing-library/react";
import { PacketRunTasksLogs } from "../../../../app/components/contents/runner";

describe("PacketRunLogs component", () => {
  it("should render logs page", () => {
    render(<PacketRunTasksLogs />);
    expect(screen.getByText(/logs/i)).toBeVisible();
  });
});

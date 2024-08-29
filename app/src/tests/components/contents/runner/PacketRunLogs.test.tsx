import { render, screen } from "@testing-library/react";
import { PacketRunLogs } from "../../../../app/components/contents/runner";

describe("PacketRunLogs component", () => {
  it("should render logs page", () => {
    render(<PacketRunLogs />);
    expect(screen.getByText(/logs/i)).toBeVisible();
  });
});

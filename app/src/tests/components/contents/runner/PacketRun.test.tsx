import { render, screen } from "@testing-library/react";
import { PacketRun } from "../../../../app/components/contents/runner";

describe("Packet Run component", () => {
  it("should render run page", () => {
    render(<PacketRun />);
    expect(screen.getByText(/run/i)).toBeVisible();
  });
});

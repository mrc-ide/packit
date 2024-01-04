import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PacketRunner } from "../../../../app/components/contents";

describe("packet runner component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <PacketRunner />
      </MemoryRouter>
    );
  };

  it("renders skeleton text", async () => {
    renderElement();

    const content = await screen.findByText("Packet runner page");

    expect(content).toBeInTheDocument();
  });
});

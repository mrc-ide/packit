import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WorkflowRunner } from "@components/contents";

describe("workflow runner component", () => {
  it("renders skeleton text", async () => {
    render(
      <MemoryRouter>
        <WorkflowRunner />
      </MemoryRouter>
    );

    const content = await screen.findByText("Workflow runner page");

    expect(content).toBeInTheDocument();
  });
});

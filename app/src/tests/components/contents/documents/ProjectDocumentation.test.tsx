import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectDocumentation } from "@components/contents/documents";

describe("project documentation component", () => {
  it("renders skeleton div", async () => {
    render(
      <MemoryRouter>
        <ProjectDocumentation />
      </MemoryRouter>
    );

    const content = await screen.findByText("Project documentation page");

    expect(content).toBeInTheDocument();
  });
});

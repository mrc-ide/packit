import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChangeLogs } from "@components/contents";

describe("Changelogs component", () => {
  it("renders TODO", async () => {
    render(
      <MemoryRouter>
        <ChangeLogs />
      </MemoryRouter>
    );

    const content = screen.getByText(/todo/i);

    expect(content).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../app/App";

describe("app component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
  };

  it("renders reports page", async () => {
    await waitFor(() => {
      expect(screen.getByText(/list of packet groups/i)).toBeVisible();
    });
  });

  it("renders app header", () => {
    renderElement();
    const header = screen.getByTestId("header");
    expect(header).toBeInTheDocument();
  });

  it("renders app main", () => {
    renderElement();
    const main = screen.getByTestId("main");
    expect(main).toBeInTheDocument();
  });
});

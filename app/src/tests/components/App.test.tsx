import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../app/App";
import { UserProvider } from "../../app/components/providers/UserProvider";

describe("app component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter initialEntries={["/"]}>
        <UserProvider>
          <App />
        </UserProvider>
      </MemoryRouter>
    );
  };

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

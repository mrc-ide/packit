import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "../../app/components/providers/UserProvider";
import { RedirectOnLoginProvider } from "../../app/components/providers/RedirectOnLoginProvider";
import { App } from "../../app/App";

describe("app component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter initialEntries={["/"]}>
        <UserProvider>
          <RedirectOnLoginProvider>
            <App />
          </RedirectOnLoginProvider>
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

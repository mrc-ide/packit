import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "@components/providers/UserProvider";
import { RedirectOnLoginProvider } from "@components/providers/RedirectOnLoginProvider";
import { App } from "@/app/App";
import { BrandingProvider } from "@components/providers/BrandingProvider";

describe("app component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter initialEntries={["/"]}>
        <UserProvider>
          <BrandingProvider>
            <RedirectOnLoginProvider>
              <App />
            </RedirectOnLoginProvider>
          </BrandingProvider>
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

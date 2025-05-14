import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RedirectOnLoginProvider } from "../../../app/components/providers/RedirectOnLoginProvider";
import { ThemeProvider } from "../../../app/components/providers/ThemeProvider";
import * as UserProvider from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { mockUserProviderState, mockUserState } from "../../mocks";
import { Header } from "../../../app/components/header";

const mockUseUser = jest.spyOn(UserProvider, "useUser");

describe("header component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          <RedirectOnLoginProvider>
            <Header />
          </RedirectOnLoginProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };
  it("can render header user related items when authenticated", () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    expect(screen.getByText("LJ")).toBeInTheDocument();
  });

  it("should change theme when theme button is clicked", async () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    const darkThemeButton = screen.getByRole("button", { name: "theme-light" });

    await userEvent.click(darkThemeButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "theme-dark" })).toBeInTheDocument();
    });
  });

  it("should render link to manage access when user has user.manage authority", () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    expect(screen.getByRole("link", { name: "Manage Access" })).toBeInTheDocument();
  });
  it("should not render link to manage access when user does not have user.manage authority", () => {
    mockUseUser.mockReturnValue({ authorities: [] } as any);
    renderElement();

    expect(screen.queryByRole("link", { name: "Manage Access" })).not.toBeInTheDocument();
  });

  it("should render left nav is user is present", async () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    expect(screen.getByRole("link", { name: /runner/i })).toBeInTheDocument();
  });
});

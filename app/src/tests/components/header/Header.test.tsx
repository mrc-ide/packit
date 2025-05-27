import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RedirectOnLoginProvider } from "../../../app/components/providers/RedirectOnLoginProvider";
import { ThemeProvider } from "../../../app/components/providers/ThemeProvider";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { mockUserState } from "../../mocks";
import { Header } from "../../../app/components/header";
import { BrandingProvider } from "../../../app/components/providers/BrandingProvider";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("header component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          <UserProvider>
            <BrandingProvider>
              <RedirectOnLoginProvider>
                <Header />
              </RedirectOnLoginProvider>
            </BrandingProvider>
          </UserProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it("can render header user related items when authenticated", async () => {
    const DOWN_ARROW = { keyCode: 40 };
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState());
    renderElement();
    fireEvent.keyDown(await screen.findByLabelText("Account"), DOWN_ARROW);

    expect(screen.getByText("LJ")).toBeInTheDocument();
    expect(screen.getByTestId("user-display-name")).toHaveTextContent("LeBron James");
    expect(screen.getByTestId("username")).toHaveTextContent("goat@example.com");
  });

  it("should change theme when theme button is clicked", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState());
    renderElement();

    const darkThemeButton = screen.getByRole("button", { name: "theme-light" });

    await userEvent.click(darkThemeButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "theme-dark" })).toBeInTheDocument();
    });
  });

  it("should render link to manage access when user has user.manage authority", () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState());
    renderElement();

    expect(screen.getByRole("link", { name: "Manage Access" })).toBeInTheDocument();
  });

  it("should not render link to manage access when user does not have user.manage authority", () => {
    mockGetUserFromLocalStorage.mockReturnValue({ ...mockUserState(), authorities: [] });
    renderElement();

    expect(screen.queryByRole("link", { name: "Manage Access" })).not.toBeInTheDocument();
  });

  it("should render nav menu if user is present", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState());
    renderElement();

    expect(screen.getByRole("link", { name: /runner/i })).toBeInTheDocument();
  });

  it("should render the app title", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState());
    renderElement();

    await waitFor(() => {
      expect(screen.getByText(/app title/i)).toBeInTheDocument();
    });
  });

  it("should render the logo, with alt text, correct image filename, and correct link destination", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState());
    renderElement();

    await waitFor(() => {
      const logo = screen.getByAltText("This logo has alt text");
      expect(logo).toHaveAttribute("src", "/img/logo-for-website.png");
      expect(logo.parentElement).toHaveAttribute("href", "https://example.com");
    });
  });
});

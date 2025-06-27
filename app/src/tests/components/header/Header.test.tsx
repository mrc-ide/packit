import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RedirectOnLoginProvider } from "../../../app/components/providers/RedirectOnLoginProvider";
import { ThemeProvider } from "../../../app/components/providers/ThemeProvider";
import * as UserProvider from "../../../app/components/providers/UserProvider";
import { mockUserProviderState } from "../../mocks";
import { Header } from "../../../app/components/header";
import { BrandingProvider } from "../../../app/components/providers/BrandingProvider";
import { expectThemeClass, handleRequestWithEnabledThemes } from "../../testUtils";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";
import { SWRConfig } from "swr";

const mockUseUser = jest.spyOn(UserProvider, "useUser");

describe("header component", () => {
  const renderElement = () => {
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter>
          <ThemeProvider>
            <BrandingProvider>
              <RedirectOnLoginProvider>
                <Header />
              </RedirectOnLoginProvider>
            </BrandingProvider>
          </ThemeProvider>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  afterEach(() => {
    localStorage.removeItem(LocalStorageKeys.THEME);
  });

  it("can render user related items when authenticated", async () => {
    const DOWN_ARROW = { keyCode: 40 };
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();
    fireEvent.keyDown(await screen.findByLabelText("Account"), DOWN_ARROW);

    expect(screen.getByText("LJ")).toBeInTheDocument();
    expect(screen.getByTestId("user-display-name")).toHaveTextContent("LeBron James");
    expect(screen.getByTestId("username")).toHaveTextContent("goat@example.com");
  });

  it("should change theme when theme button is clicked", async () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    const darkThemeButton = await screen.findByRole("button", { name: "theme-dark" });

    await userEvent.click(darkThemeButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "theme-light" })).toBeInTheDocument();
      expectThemeClass("dark");
      expect(localStorage.getItem(LocalStorageKeys.THEME)).toBe("dark");
    });

    const lightThemeButton = screen.getByRole("button", { name: "theme-light" });

    await userEvent.click(lightThemeButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "theme-dark" })).toBeInTheDocument();
      expectThemeClass("light");
      expect(localStorage.getItem(LocalStorageKeys.THEME)).toBe("light");
    });
  });

  it("should not render the theme toggle when only dark mode is available to be applied", async () => {
    handleRequestWithEnabledThemes(["dark"]);

    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    expect(screen.queryByRole("button", { name: "theme-dark" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "theme-light" })).not.toBeInTheDocument();

    await waitFor(() => expectThemeClass("dark"));
  });

  it("should not render the theme toggle when only light mode is available to be applied", async () => {
    handleRequestWithEnabledThemes(["light"]);

    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    expect(screen.queryByRole("button", { name: "theme-dark" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "theme-light" })).not.toBeInTheDocument();

    await waitFor(() => expectThemeClass("light"));
  });

  it("should render link to admin when user has user.manage authority", () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
  });

  it("should not render link to admin when user does not have user.manage or packet.manage authority", () => {
    mockUseUser.mockReturnValue({ authorities: [] } as any);
    renderElement();

    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });

  it("should render nav menu if user is present", async () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    expect(screen.getByRole("link", { name: /runner/i })).toBeInTheDocument();
  });

  it("should render the app title", async () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    await waitFor(() => {
      expect(screen.getByText(/app title/i)).toBeInTheDocument();
    });
  });

  it("should render the logo, with alt text, correct image filename, and correct link destination", async () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    await waitFor(() => {
      const logo = screen.getByAltText("This logo has alt text");
      expect(logo).toHaveAttribute("src", "/img/logo-for-website.png");
      expect(logo.parentElement).toHaveAttribute("href", "https://example.com");
    });
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "../../../app/components/header/Header";
import { LeftNavItems } from "../../../app/components/header/LeftNav";
import { ThemeProvider } from "../../../app/components/providers/ThemeProvider";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { mockUserState } from "../../mocks";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("header component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider defaultTheme="dark">
          <UserProvider>
            <Header />
          </UserProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };
  it("can render header user related items when authenticated", () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState);
    renderElement();

    for (const navItem of Object.values(LeftNavItems)) {
      expect(screen.getByText(navItem)).toBeVisible();
    }
    expect(screen.getByText("LJ")).toBeInTheDocument();
  });

  it("should change theme when theme button is clicked", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState);
    renderElement();

    const darkThemeButton = screen.getByRole("button", { name: "theme-dark" });

    await userEvent.click(darkThemeButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "theme-light" })).toBeInTheDocument();
    });
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AccountHeaderDropdown } from "../../../app/components/header/AccountHeaderDropdown";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";
import { mockUserState } from "../../mocks";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate
}));
const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("header drop down menu component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <UserProvider>
          <AccountHeaderDropdown />
        </UserProvider>
      </MemoryRouter>
    );
  };

  it("renders drop down menu without user info if not authenticated", async () => {
    renderElement();

    expect(await screen.findByText("XX")).toBeInTheDocument();
  });

  it("renders drop down menu without user info if authenticated", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState);
    renderElement();

    expect(await screen.findByText("LJ")).toBeInTheDocument();
  });

  it("deletes user local storage key when log out is clicked", async () => {
    const DOWN_ARROW = { keyCode: 40 };
    localStorage.setItem(LocalStorageKeys.USER, "mockUser");
    renderElement();
    fireEvent.keyDown(await screen.findByRole("button"), DOWN_ARROW);
    userEvent.click(await screen.findByText("Log out"));
    expect(localStorage.getItem(LocalStorageKeys.USER)).toBe(null)
  });
});

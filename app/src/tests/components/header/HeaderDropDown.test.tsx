import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AccountHeaderDropdown } from "../../../app/components/header/AccountHeaderDropdown";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
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
});

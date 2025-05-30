import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AccountHeaderDropdown } from "../../../app/components/header/AccountHeaderDropdown";
import * as UserProvider from "../../../app/components/providers/UserProvider";
import { mockUserProviderState } from "../../mocks";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate
}));
const mockSetLoggingOut = jest.fn();
jest.mock("../../../app/components/providers/RedirectOnLoginProvider", () => ({
  useRedirectOnLogin: () => ({
    setLoggingOut: mockSetLoggingOut
  })
}));

const mockUseUser = jest.spyOn(UserProvider, "useUser");

describe("header drop down menu component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <AccountHeaderDropdown />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders drop down menu without user initials if not authenticated", async () => {
    mockUseUser.mockReturnValue({ ...mockUserProviderState(), user: null });
    renderElement();

    expect(await screen.findByText("XX")).toBeInTheDocument();
  });

  it("renders drop down menu without user info if authenticated", async () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();

    expect(await screen.findByText("LJ")).toBeInTheDocument();
  });

  it("calls removeUser and setLoggingOut on logout click", async () => {
    const state = mockUserProviderState();
    mockUseUser.mockReturnValue(state);
    const DOWN_ARROW = { keyCode: 40 };

    renderElement();

    fireEvent.keyDown(await screen.findByRole("button"), DOWN_ARROW);
    userEvent.click(await screen.findByText("Log out"));
    expect(state.removeUser).toHaveBeenCalled();
    expect(mockSetLoggingOut).toHaveBeenCalledWith(true);
  });
});

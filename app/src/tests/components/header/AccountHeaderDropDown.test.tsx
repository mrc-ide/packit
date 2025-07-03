import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AccountHeaderDropdown } from "../../../app/components/header/AccountHeaderDropdown";
import * as UserProvider from "../../../app/components/providers/UserProvider";
import { mockUserProviderState } from "../../mocks";

const mockedUsedNavigate = vitest.fn();
vitest.mock("react-router-dom", async () => ({
  ...((await vitest.importActual("react-router-dom")) as any),
  useNavigate: () => mockedUsedNavigate
}));
const mockSetLoggingOut = vitest.fn();
vitest.mock("../../../app/components/providers/RedirectOnLoginProvider", () => ({
  useRedirectOnLogin: () => ({
    setLoggingOut: mockSetLoggingOut
  })
}));
const mockUseUser = vitest.spyOn(UserProvider, "useUser");

const DOWN_ARROW = { keyCode: 40 };

describe("header drop down menu component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <AccountHeaderDropdown />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vitest.clearAllMocks();
  });

  it("renders drop down menu without user initials if not authenticated", async () => {
    mockUseUser.mockReturnValue({ ...mockUserProviderState(), user: null });
    renderElement();

    fireEvent.keyDown(await screen.findByLabelText("Account"), DOWN_ARROW);

    expect(await screen.findByText("XX")).toBeInTheDocument();
    expect(screen.getByTestId("user-display-name")).toHaveTextContent("");
    expect(screen.getByTestId("username")).toHaveTextContent("");
  });

  it("renders drop down menu with user initials if authenticated", async () => {
    mockUseUser.mockReturnValue(mockUserProviderState());
    renderElement();
    fireEvent.keyDown(await screen.findByLabelText("Account"), DOWN_ARROW);

    expect(await screen.findByText("LJ")).toBeInTheDocument();
    expect(screen.getByTestId("user-display-name")).toHaveTextContent("LeBron James");
    expect(screen.getByTestId("username")).toHaveTextContent("goat@example.com");
  });

  it("calls removeUser and setLoggingOut on logout click", async () => {
    const state = mockUserProviderState();
    mockUseUser.mockReturnValue(state);

    renderElement();

    fireEvent.keyDown(await screen.findByLabelText("Account"), DOWN_ARROW);
    userEvent.click(await screen.findByText("Log out"));

    expect(state.removeUser).toHaveBeenCalled();
    expect(mockSetLoggingOut).toHaveBeenCalledWith(true);
  });
});

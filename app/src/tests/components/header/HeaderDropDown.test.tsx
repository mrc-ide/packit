import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountHeaderDropdown from "../../../app/components/header/AccountHeaderDropdown";

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate
}));

describe("header drop down menu component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <AccountHeaderDropdown />
      </MemoryRouter>
    );
  };

  // TODO come back and fix tests
  // it.only("renders drop down menu as expected when authenticated", async () => {
  //   renderElement(getStore({ isAuthenticated: true }));

  //   const avatarButton = await screen.findByRole("button");
  //   await fireEvent.click(avatarButton);

  //   await screen.findByText("Lekan");

  //   expect(await screen.findByText("Manage access")).toBeInTheDocument();
  //   expect(await screen.findByText("Publish packets")).toBeInTheDocument();
  //   expect(await screen.findByText(/log out/)).toBeInTheDocument();
  // });

  it("does not render drop down menu when user is not logged in", async () => {
    renderElement();
    const { queryByTestId } = screen;
    expect(queryByTestId("drop-down")).toBeNull();
  });

  // it("can logout authenticated user", async () => {
  //   const store = getStore({ isAuthenticated: true });

  //   const mockDispatch = jest.spyOn(store, "dispatch");

  //   renderElement(store);

  //   const dropDown = screen.getByTestId("drop-down");

  //   const userIcon = dropDown.querySelectorAll("a")[0];

  //   await waitFor(() => {
  //     userEvent.click(userIcon);
  //   });

  //   const logoutIcon = dropDown.querySelectorAll("a")[4];

  //   expect(logoutIcon.textContent).toBe("Logout");

  //   await waitFor(() => {
  //     userEvent.click(logoutIcon);
  //   });

  //   expect(mockDispatch).toHaveBeenCalledTimes(1);

  //   expect(mockDispatch).toHaveBeenCalledWith({ type: "login/logout", payload: undefined });

  //   expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
  // });
});

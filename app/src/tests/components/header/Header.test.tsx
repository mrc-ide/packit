import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../../../app/components/header/Header";
import { LeftNavItems } from "../../../app/components/header/LeftNav";
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
        <UserProvider>
          <Header />
        </UserProvider>
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
});

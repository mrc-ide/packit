import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Home } from "../../../app/components/contents/explorer";
import { Login, Redirect } from "../../../app/components/login";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { mockUserState } from "../../mocks";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("redirect", () => {
  const renderElement = (location = "/redirect?token=fakeToken") => {
    return render(
      <UserProvider>
        <MemoryRouter initialEntries={[location]}>
          <Routes>
            <Route path="/redirect" element={<Redirect />} />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </UserProvider>
    );
  };

  it("renders redirecting if no token, user token or error", () => {
    mockGetUserFromLocalStorage.mockReturnValue(null);
    renderElement("/redirect");

    expect(screen.getByText("Redirecting user ...")).toBeInTheDocument();
  });

  it("renders home page is user is logged in", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState);
    renderElement("/redirect");

    await waitFor(() => {
      expect(screen.getByText(/parameters/i)).toBeInTheDocument();
      expect(screen.getByText(/manage packets/i)).toBeInTheDocument();
    });
  });
  it("renders home page and set user if token is present", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState);
    renderElement(`/redirect?token=${mockUserState.token}`);

    await waitFor(() => {
      expect(screen.getByText(/parameters/i)).toBeInTheDocument();
      expect(screen.getByText(/manage packets/i)).toBeInTheDocument();
    });
  });

  it("renders login page if error is present", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(null);
    renderElement("/redirect?error=invalid_token");

    await waitFor(() => {
      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid_token/i)).toBeInTheDocument();
    });

    screen.debug();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Home } from "../../../app/components/contents/explorer";
import { Login, Redirect } from "../../../app/components/login";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { mockUserState } from "../../mocks";
import { Accessibility } from "../../../app/components/contents/accessibility";
import { AuthConfigProvider } from "../../../app/components/providers/AuthConfigProvider";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage(),
  getAuthConfigFromLocalStorage: jest.fn().mockReturnValue({ authEnabled: true, enableGithubLogin: true })
}));

const mockSetRequestedUrl = jest.fn();
let mockRequestedUrl: string | null = null;
jest.mock("../../../app/components/providers/RedirectOnLoginProvider", () => ({
  useRedirectOnLogin: () => ({
    setRequestedUrl: mockSetRequestedUrl,
    requestedUrl: (() => mockRequestedUrl)()
  })
}));

describe("redirect", () => {
  const renderElement = (location = "/redirect?token=fakeToken") => {
    return render(
      <AuthConfigProvider>
        <UserProvider>
          <MemoryRouter initialEntries={[location]}>
            <Routes>
              <Route path="/redirect" element={<Redirect />} />
              <Route path="/" element={<Home />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </MemoryRouter>
        </UserProvider>
      </AuthConfigProvider>
    );
  };

  beforeEach(() => {
    mockRequestedUrl = null;
    jest.clearAllMocks();
  });

  it("renders redirecting if no token, user token or error", () => {
    mockGetUserFromLocalStorage.mockReturnValue(null);
    renderElement("/redirect");

    expect(screen.getByText("Redirecting user ...")).toBeInTheDocument();
  });

  it("renders home page if user is logged in", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState());
    renderElement("/redirect");

    await waitFor(() => {
      expect(screen.getByText(/parameters/i)).toBeInTheDocument();
      expect(screen.getByText(/manage packets/i)).toBeInTheDocument();
      expect(mockSetRequestedUrl).toHaveBeenCalledWith(null);
    });
  });

  it("renders home page and set user if token is present", async () => {
    let userState = mockUserState();
    mockGetUserFromLocalStorage.mockReturnValue(userState);
    renderElement(`/redirect?token=${userState.token}`);

    await waitFor(() => {
      expect(screen.getByText(/parameters/i)).toBeInTheDocument();
      expect(screen.getByText(/manage packets/i)).toBeInTheDocument();
      expect(mockSetRequestedUrl).toHaveBeenCalledWith(null);
    });
  });

  it("renders requested url if present", async () => {
    mockRequestedUrl = "/accessibility";
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState());
    renderElement("/redirect");
    await waitFor(() => {
      expect(screen.getByText(/Accessibility Page/i)).toBeInTheDocument();
      expect(mockSetRequestedUrl).toHaveBeenCalledWith(null);
    });
  });

  it("renders login page if error is present", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(null);
    renderElement("/redirect?error=invalid_token");

    await waitFor(() => {
      expect(screen.getByText(/login to account/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid_token/i)).toBeInTheDocument();
    });
  });
});

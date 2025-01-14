import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Home } from "../../../app/components/contents/home";
import { Login, Redirect } from "../../../app/components/login";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { mockUserState, mockExpiredUserState } from "../../mocks";
import { Accessibility } from "../../../app/components/contents/accessibility";
import { AuthConfigProvider } from "../../../app/components/providers/AuthConfigProvider";

jest.mock("../../../lib/localStorageManager", () => ({
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

const mockSetUser = jest.fn();
let mockUser: UserState | null = null;
jest.mock("../../../app/components/providers/UserProvider.tsx", () => ({
  useUser: () => ({
    setUser: mockSetUser,
    user: mockUser
  })
}));

describe("redirect", () => {
  const renderElement = (location = "/redirect?token=fakeToken") => {
    return render(
      <AuthConfigProvider>
        <MemoryRouter initialEntries={[location]}>
          <Routes>
            <Route path="/redirect" element={<Redirect />} />
            <Route path="/" element={<Home />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthConfigProvider>
    );
  };

  beforeEach(() => {
    mockRequestedUrl = null;
    mockUser = null;
    jest.clearAllMocks();
  });

  it("renders home page if no token or error", async () => {
    renderElement("/redirect");

    await waitFor(() => {
      expect(screen.getByText("Parameters Packet Group")).toBeInTheDocument();
      expect(screen.getByText(/manage packets/i)).toBeInTheDocument();
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSetRequestedUrl).toHaveBeenCalledWith(null);
    });
  });

  it("renders home page and set user if token is present", async () => {
    const userState = mockUserState();
    renderElement(`/redirect?token=${userState.token}`);

    await waitFor(() => {
      expect(screen.getByText("Parameters Packet Group")).toBeInTheDocument();
      expect(screen.getByText(/manage packets/i)).toBeInTheDocument();
      expect(mockSetUser).toHaveBeenCalledWith(userState.token);
      expect(mockSetRequestedUrl).toHaveBeenCalledWith(null);
    });
  });

  it("renders home page and replaces existing expired token", async () => {
    mockUser = mockExpiredUserState();

    const userState = mockUserState();
    renderElement(`/redirect?token=${userState.token}`);

    await waitFor(() => {
      expect(screen.getByText("Parameters Packet Group")).toBeInTheDocument();
      expect(screen.getByText(/manage packets/i)).toBeInTheDocument();
      expect(mockSetRequestedUrl).toHaveBeenCalledWith(null);
      expect(mockSetUser).toHaveBeenCalledWith(userState.token);
    });
  });

  it("renders requested url if present", async () => {
    mockRequestedUrl = "/accessibility";

    const userState = mockUserState();
    renderElement(`/redirect?token=${userState.token}`);

    await waitFor(() => {
      expect(screen.getByText(/Accessibility Page/i)).toBeInTheDocument();
      expect(mockSetRequestedUrl).toHaveBeenCalledWith(null);
      expect(mockSetUser).toHaveBeenCalledWith(userState.token);
    });
  });

  it("renders login page if error is present", async () => {
    renderElement("/redirect?error=invalid_token");

    await waitFor(() => {
      expect(screen.getByText(/log in to account/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid_token/i)).toBeInTheDocument();
    });
  });
});

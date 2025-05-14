import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as UserProvider from "../../../app/components/providers/UserProvider";
import { ProtectedRoute } from "../../../app/components/routes/ProtectedRoute";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";
import { mockUserProviderState } from "../../mocks";
const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate
}));
const mockIsAuthenticated = jest.fn();
const mockAuthIsExpired = jest.fn();
jest.mock("../../../lib/isAuthenticated", () => ({
  isAuthenticated: () => mockIsAuthenticated(),
  authIsExpired: () => mockAuthIsExpired()
}));

const mockSetRequestedUrl = jest.fn();
let mockLoggingOut = false;
jest.mock("../../../app/components/providers/RedirectOnLoginProvider", () => ({
  useRedirectOnLogin: () => ({
    setRequestedUrl: mockSetRequestedUrl,
    loggingOut: (() => mockLoggingOut)()
  })
}));

const mockUseAuthConfig = jest.fn();
jest.mock("../../../app/components/providers/AuthConfigProvider", () => ({
  useAuthConfig: () => mockUseAuthConfig()
}));

const mockUserProvideState = mockUserProviderState();
const mockUseUser = jest.spyOn(UserProvider, "useUser");

const mockWindowNavigate = jest.fn();
jest.mock("../../../lib/navigate", () => ({
  windowNavigate: (href: string) => mockWindowNavigate(href)
}));

const renderElement = () => {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<div>Protected Content</div>} index />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};
describe("protected routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue(mockUserProvideState);
  });

  it("renders protected content when authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockAuthIsExpired.mockReturnValue(false);
    mockUseAuthConfig.mockReturnValue({});
    renderElement();

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeVisible();
    });
  });

  it("should navigate to login and set requested url when unauthenticated", async () => {
    mockLoggingOut = false;
    mockIsAuthenticated.mockReturnValue(false);
    mockAuthIsExpired.mockReturnValue(false);
    mockUseAuthConfig.mockReturnValue({});
    renderElement();

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
      expect(mockSetRequestedUrl).toHaveBeenCalledWith("/");
    });
  });

  it("navigates to login, sets requested url, & logs the user out when auth expiry time is in the past", async () => {
    mockLoggingOut = false;
    mockIsAuthenticated.mockReturnValue(false);
    mockAuthIsExpired.mockReturnValue(true);
    mockUseAuthConfig.mockReturnValue({});
    renderElement();

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        "/login?info=You have been signed out because your session expired. Please log in."
      );
      expect(mockSetRequestedUrl).toHaveBeenCalledWith("/");
      expect(mockUserProvideState.removeUser).toHaveBeenCalled();
    });
  });

  it("should not set requested url when logging out", async () => {
    mockLoggingOut = true;
    mockIsAuthenticated.mockReturnValue(false);
    mockAuthIsExpired.mockReturnValue(false);
    mockUseAuthConfig.mockReturnValue({});
    renderElement();

    await waitFor(() => {
      expect(mockWindowNavigate).not.toHaveBeenCalled();
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
      expect(mockSetRequestedUrl).not.toHaveBeenCalled();
    });
  });

  it("navigates to external logout on expiry if preauth is enabled", async () => {
    mockUseAuthConfig.mockReturnValue({ enablePreAuthLogin: true });
    mockLoggingOut = false;
    mockIsAuthenticated.mockReturnValue(false);
    mockAuthIsExpired.mockReturnValue(true);
    localStorage.setItem(LocalStorageKeys.USER, "mockUser");
    renderElement();

    await waitFor(() => {
      expect(mockWindowNavigate).toHaveBeenCalledWith("/logout");
      expect(mockedUsedNavigate).not.toHaveBeenCalled();
    });
  });
});

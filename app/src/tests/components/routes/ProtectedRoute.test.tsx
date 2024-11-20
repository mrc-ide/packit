import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import ProtectedRoute from "../../../app/components/routes/ProtectedRoute";
import {UserState} from "../../../app/components/providers/types/UserTypes";
import {mockExpiredUserState} from "../../mocks";
import {LocalStorageKeys} from "../../../lib/types/LocalStorageKeys";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate
}));
const mockIsAuthenticated = jest.fn();
const mockAuthIsPreExpiry = jest.fn();
jest.mock("../../../lib/isAuthenticated", () => ({
  isAuthenticated: () => mockIsAuthenticated(),
  authIsPreExpiry: () => mockAuthIsPreExpiry()
}));

const mockSetRequestedUrl = jest.fn();
let mockLoggingOut = false;
jest.mock("../../../app/components/providers/RedirectOnLoginProvider", () => ({
  useRedirectOnLogin: () => ({
    setRequestedUrl: mockSetRequestedUrl,
    loggingOut: (() => mockLoggingOut)()
  })
}));

jest.mock("../../../app/components/providers/AuthConfigProvider", () => ({
  useAuthConfig: () => ({})
}));

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("protected routes", () => {
  const renderElement = () => {
    return render(
      <UserProvider>
        <MemoryRouter>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<div>Protected Content</div>} index />
            </Route>
          </Routes>
        </MemoryRouter>
      </UserProvider>
    );
  };

  it("renders protected content when authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockAuthIsPreExpiry.mockReturnValue(true);
    renderElement();

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeVisible();
    });
  });

  it("should navigate to login and set requested url when unauthenticated", async () => {
    mockLoggingOut = false;
    mockIsAuthenticated.mockReturnValue(false);
    mockAuthIsPreExpiry.mockReturnValue(true);
    renderElement();

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
      expect(mockSetRequestedUrl).toHaveBeenCalledWith("/");
    });
  });

  it("navigates to login, sets requested url, & logs the user out when auth expiry time is in the past", async () => {
    mockLoggingOut = false;
    mockIsAuthenticated.mockReturnValue(false);
    mockAuthIsPreExpiry.mockReturnValue(false);
    mockGetUserFromLocalStorage.mockReturnValueOnce(mockExpiredUserState());
    localStorage.setItem(LocalStorageKeys.USER, "mockUser");
    renderElement();

    await waitFor(() => {
      expect(mockedUsedNavigate)
        .toHaveBeenCalledWith("/login?info=You have been signed out because your session expired. Please log in.");
      expect(mockSetRequestedUrl).toHaveBeenCalledWith("/");
      expect(localStorage.getItem(LocalStorageKeys.USER)).toBe(null);
    });
  });

  it("should not set requested url when logging out", async () => {
    mockLoggingOut = true;
    mockIsAuthenticated.mockReturnValue(false);
    mockAuthIsPreExpiry.mockReturnValue(true);
    renderElement();

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
      expect(mockSetRequestedUrl).not.toHaveBeenCalled();
    });
  });
});

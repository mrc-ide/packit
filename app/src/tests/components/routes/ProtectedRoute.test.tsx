import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import ProtectedRoute from "../../../app/components/routes/ProtectedRoute";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate
}));
const mockIsAuthenticated = jest.fn();
jest.mock("../../../lib/isAuthenticated", () => ({
  isAuthenticated: () => mockIsAuthenticated()
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
    renderElement();

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeVisible();
    });
  });

  it("should navigate to login when unauthenticated", async () => {
    mockIsAuthenticated.mockReturnValue(false);
    renderElement();

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
    });
  });

  // it("renders protected routes when auth is enabled and user is authenticated using access token", () => {
  //   const store = getStore({ authConfig: { enableAuth: true } });
  //   const mockDispatch = jest.spyOn(store, "dispatch");
  //   renderElement(store);

  //   store.dispatch({ type: "login/saveUser", payload: { token: "fakeToken" } });

  //   expect(mockDispatch).toHaveBeenCalledTimes(2);
  //   expect(mockDispatch).toHaveBeenCalledWith({
  //     type: "login/saveUser",
  //     payload: { token: "fakeToken" }
  //   });
  //   expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
  // });

  // it("redirects to login page when user is unauthenticated and authentication is enabled", () => {
  //   const store = getStore({ authConfig: { enableAuth: true } });
  //   const mockDispatch = jest.spyOn(store, "dispatch");
  //   renderElement(store);
  //   expect(mockDispatch).toHaveBeenCalledTimes(1);
  //   expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
  // });

  // it("does not redirect to login page when user is unauthenticated and authentication is disabled", () => {
  //   const store = getStore();
  //   const mockDispatch = jest.spyOn(store, "dispatch");
  //   renderElement(store);
  //   expect(mockDispatch).toHaveBeenCalledTimes(1);
  //   expect(mockedUsedNavigate).not.toHaveBeenCalledWith("/login");
  // });

  // it("does not render protected routes when user is unauthenticated using access token", () => {
  //   const store = getStore();
  //   const mockDispatch = jest.spyOn(store, "dispatch");
  //   renderElement(store);
  //   expect(mockDispatch).toHaveBeenCalledTimes(1);
  // });
});

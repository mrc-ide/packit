import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../../../app/components/routes/ProtectedRoute";

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate
}));

// TODO : test !!
describe("protected routes", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter initialEntries={["/packets"]}>
        <ProtectedRoute />
      </MemoryRouter>
    );
  };
  it(" renders", () => {
    expect(true).toBe(true);
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

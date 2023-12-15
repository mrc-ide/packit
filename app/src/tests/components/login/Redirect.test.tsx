import { Store } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Home } from "../../../app/components/contents/explorer";
import { Login, Redirect } from "../../../app/components/login";
import { LoginState } from "../../../types";
import { mockLoginState, mockPacketsState } from "../../mocks";

describe("redirect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getStore = (props: Partial<LoginState> = {}) => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const initialRootStates = {
      login: mockLoginState(props),
      packets: mockPacketsState()
    };

    return mockStore(initialRootStates);
  };

  const renderElement = (store: Store = getStore(), location = "/redirect?token=fakeToken") => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[location]}>
          <Routes>
            <Route path="/redirect" element={<Redirect />} />
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it("can render redirect correctly for successful login when store has not updated", () => {
    const store = getStore();
    const mockDispatch = jest.spyOn(store, "dispatch");
    renderElement(store);
    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "login/saveUser", payload: { token: "fakeToken" } });
  });

  it("can render redirect correctly for failedlogin when store has not updated", () => {
    const store = getStore();
    const mockDispatch = jest.spyOn(store, "dispatch");
    renderElement(store, "/redirect?error=bad token");
    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "login/loginError", payload: "bad token" });
  });

  it("can redirect for successful login when store has updated", async () => {
    const store = getStore({ isAuthenticated: true });
    const mockDispatch = jest.spyOn(store, "dispatch");
    renderElement(store);

    await waitFor(() => {
      expect(screen.getByText(/manage packets/i)).toBeVisible();
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("can redirect for failed login when store has updated", () => {
    const error = { error: "Login failed", detail: "bad token" };
    const store = getStore({ userError: { error } });
    const mockDispatch = jest.spyOn(store, "dispatch");
    renderElement(store, "/redirect?error=bad token");
    expect(screen.getByText("bad token")).toBeVisible();
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });
});

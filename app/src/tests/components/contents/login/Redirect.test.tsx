import { Store } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Explorer } from "../../../../app/components/contents";
import { Redirect } from "../../../../app/components/login";
import { LoginState } from "../../../../types";
import { mockLoginState, mockPacketsState } from "../../../mocks";

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

  const renderElement = (store: Store = getStore()) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/redirect?token=fakeToken"]}>
          <Routes>
            <Route path="/redirect" element={<Redirect />} />
            <Route path="/" element={<Explorer />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it("can render redirect correctly when user is unauthenticated", () => {
    const store = getStore();
    const mockDispatch = jest.spyOn(store, "dispatch");
    renderElement(store);
    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "login/saveUser", payload: { token: "fakeToken" } });
  });

  it("can redirect when user is authenticated", () => {
    const store = getStore({ isAuthenticated: true });
    const mockDispatch = jest.spyOn(store, "dispatch");
    renderElement(store);
    expect(screen.getByText("Packets (0)")).toBeVisible();
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });
});

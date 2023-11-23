import { Store } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import App from "../app/App";
import { LoginState } from "../types";
import { mockLoginState, mockPacketsState } from "./mocks";

describe("app component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const getStore = (props: Partial<LoginState> = {}) => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const initialRootStates = {
      packets: mockPacketsState(),
      login: mockLoginState(props)
    };

    return mockStore(initialRootStates);
  };

  const renderElement = (store: Store = getStore()) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/login"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );
  };

  it("renders packet explorer page", () => {
    renderElement(getStore({ isAuthenticated: true }));
    const app = screen.getByTestId("app");
    expect(app).toHaveTextContent("Packets (0)");
    expect(app).toHaveTextContent("Click on a column heading to sort by field.");
    expect(app.className).toBe("default");
  });

  it("renders app header", () => {
    renderElement();
    const header = screen.getByTestId("header");
    expect(header).toBeInTheDocument();
  });

  it("renders app main", () => {
    renderElement();
    const main = screen.getByTestId("main");
    expect(main).toBeInTheDocument();
  });
});

import { Store } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import Header from "../../../app/components/header/Header";
import { ThemeProvider } from "../../../app/components/providers/ThemeProvider";
import { LoginState } from "../../../types";
import { mockLoginState } from "../../mocks";

describe("header component", () => {
  const getStore = (props: Partial<LoginState> = {}) => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const initialRootStates = {
      login: mockLoginState(props)
    };

    return mockStore(initialRootStates);
  };

  const renderElement = (store: Store = getStore()) => {
    return render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
  };
  // TODO add tests
  it("can render header", () => {
    renderElement();
  });
});

import { Store } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Login } from "../../../app/components/login";
import { LoginState } from "../../../types";
import { mockLoginState } from "../../mocks";

describe("login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
        <MemoryRouter initialEntries={["/login"]}>
          <Login />
        </MemoryRouter>
      </Provider>
    );
  };

  it("can render github login", () => {
    renderElement(
      getStore({
        authConfig: {
          enableFormLogin: false,
          enableGithubLogin: true
        }
      })
    );
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it("can render token error", () => {
    renderElement(
      getStore({
        userError: { error: { detail: "ERROR DETAIL", error: "ERROR" } },
        authConfig: {
          enableFormLogin: true,
          enableGithubLogin: true
        }
      })
    );

    expect(screen.getByText(/ERROR DETAIL/)).toBeInTheDocument();
  });

  it("can navigate to github login", () => {
    const store = getStore({
      authConfig: {
        enableFormLogin: true,
        enableGithubLogin: true
      }
    });

    const mockDispatch = jest.spyOn(store, "dispatch");

    renderElement(store);

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    const githubLogin = screen.getByRole("link", { name: /github/i });

    userEvent.click(githubLogin);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

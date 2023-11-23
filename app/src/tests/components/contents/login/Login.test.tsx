import { Store } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Login } from "../../../../app/components/login";
import { LoginState, UserLoginDetailProps } from "../../../../types";
import { mockLoginState } from "../../../mocks";

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

  it("can render both login methods", () => {
    renderElement(
      getStore({
        authConfig: {
          enableFormLogin: true,
          enableGithubLogin: true
        }
      })
    );

    expect(screen.getByRole("button", { name: /email/i })).toBeVisible();
    expect(screen.getByText(/Github/)).toBeInTheDocument();
  });

  it("can handle submit form login", () => {
    const store = getStore({
      authConfig: {
        enableFormLogin: true
      }
    });

    const mockDispatch = jest.spyOn(store, "dispatch");

    renderElement(store);

    loginWithUsernameAndPassword({ email: "test@example.com", password: "password123" });

    expect(mockDispatch).toHaveBeenCalledTimes(2);
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

    fireEvent.click(githubLogin);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

const loginWithUsernameAndPassword = (user: UserLoginDetailProps) => {
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const loginButton = screen.getByRole("button", { name: /email/i });

  fireEvent.change(emailInput, { target: { value: user.email } });
  fireEvent.change(passwordInput, { target: { value: user.password } });
  fireEvent.click(loginButton);
};

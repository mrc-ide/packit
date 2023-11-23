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

  it("can render form login", () => {
    renderElement(
      getStore({
        authConfig: {
          enableFormLogin: true,
          enableGithubLogin: false
        }
      })
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button").textContent).toBe("Login");
    expect(screen.queryByText("Login With GitHub")).toBeNull();
  });

  it("can render github login", () => {
    renderElement(
      getStore({
        authConfig: {
          enableFormLogin: false,
          enableGithubLogin: true
        }
      })
    );
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Email")).toBeNull();
    expect(screen.getByText("Login With GitHub")).toBeInTheDocument();
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

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button").textContent).toBe("Login");
    expect(screen.getByText("OR")).toBeInTheDocument();
    expect(screen.getByText("Login With GitHub")).toBeInTheDocument();
    expect(screen.getByText("ERROR DETAIL")).toBeInTheDocument();
  });

  it("can render both login methods", () => {
    renderElement(
      getStore({
        authConfig: {
          enableFormLogin: true,
          enableGithubLogin: true
        }
      })
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button").textContent).toBe("Login");
    expect(screen.getByText("OR")).toBeInTheDocument();
    expect(screen.getByText("Login With GitHub")).toBeInTheDocument();
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

  it("can render invalid email feedback", () => {
    const store = getStore({
      authConfig: {
        enableFormLogin: true
      }
    });

    const mockDispatch = jest.spyOn(store, "dispatch");

    renderElement(store);

    loginWithUsernameAndPassword({ email: "test@example", password: "password123" });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Invalid email format")).toBeInTheDocument();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("can render required password feedback", () => {
    const store = getStore({
      authConfig: {
        enableFormLogin: true
      }
    });

    const mockDispatch = jest.spyOn(store, "dispatch");

    renderElement(store);

    loginWithUsernameAndPassword({ email: "test@example.com", password: "" });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Password is required")).toBeInTheDocument();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("can render required email feedback", () => {
    const store = getStore({
      authConfig: {
        enableFormLogin: true
      }
    });

    const mockDispatch = jest.spyOn(store, "dispatch");

    renderElement(store);

    loginWithUsernameAndPassword({ email: "", password: "pass" });

    expect(screen.getByText("Email is required")).toBeInTheDocument();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
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

    const githubLogin = screen.getByText("Login With GitHub");

    fireEvent.click(githubLogin);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

const loginWithUsernameAndPassword = (user: UserLoginDetailProps) => {
  const emailInput = screen.getByLabelText("Email");
  const passwordInput = screen.getByLabelText("Password");
  const loginButton = screen.getAllByText("Login")[1];

  fireEvent.change(emailInput, { target: { value: user.email } });
  fireEvent.change(passwordInput, { target: { value: user.password } });
  fireEvent.click(loginButton);
};

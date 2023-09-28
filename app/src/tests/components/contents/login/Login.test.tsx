import React from "react";
import {LoginState} from "../../../../types";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {mockLoginState} from "../../../mocks";
import {Store} from "@reduxjs/toolkit";
import {fireEvent, render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";
import {Login} from "../../../../app/components/login";

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
                    <Login/>
                </MemoryRouter>
            </Provider>);
    };

    it("can render form login", () => {
        renderElement(getStore(
            {
                authConfig: {
                    enableFormLogin: true,
                    enableGithubLogin: false
                }
            }));

        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button").textContent).toBe("Login");
        expect(screen.queryByText("Login With GitHub")).toBeNull();
    });

    it("can render github login", () => {
        renderElement(getStore(
            {
                authConfig: {
                    enableFormLogin: false,
                    enableGithubLogin: true
                }
            }));
        expect(screen.getByText("Login")).toBeInTheDocument();
        expect(screen.queryByText("Email")).toBeNull();
        expect(screen.getByText("Login With GitHub")).toBeInTheDocument();
    });

    it("can render both login methods", () => {
        renderElement(getStore(
            {
                authConfig: {
                    enableFormLogin: true,
                    enableGithubLogin: true
                }
            }));

        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button").textContent).toBe("Login");
        expect(screen.getByText("Login With GitHub")).toBeInTheDocument();
    });

    it("can handle submit form login", () => {
        const store = getStore(
            {
                authConfig: {
                    enableFormLogin: true,
                    enableGithubLogin: true
                }
            });

        const mockDispatch = jest.spyOn(store, "dispatch");

        renderElement(store);

        expect(mockDispatch).toHaveBeenCalledTimes(1);

        const emailInput = screen.getByLabelText("Email");
        const passwordInput = screen.getByLabelText("Password");
        const loginButton = screen.getAllByText("Login")[1];

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(loginButton);

        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });

    it("can navigate to github login", () => {
        const store = getStore(
            {
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

import React from "react";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {Store} from "@reduxjs/toolkit";
import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";
import ProtectedRoute from "../../../app/components/routes/ProtectedRoute";
import {LoginState} from "../../../types";
import {mockLoginState} from "../../mocks";
import {saveCurrentUser} from "../../../localStorageManager";

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom") as any,
    useNavigate: () => mockedUsedNavigate,
}));

describe("protected routes", () => {
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
                <MemoryRouter initialEntries={["/packets"]}>
                    <ProtectedRoute/>
                </MemoryRouter>
            </Provider>);
    };

    it("renders protected routes when auth is enabled and user is authenticated using access token", () => {
        const store = getStore({authConfig: {enableAuth: true}});
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store);

        store.dispatch({ type: "login/saveUser", payload: { token: "fakeToken" } });

        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenCalledWith(
            {
                type: "login/saveUser",
                payload: {token: "fakeToken"}
            });
        expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
    });

    it("redirects to login page when user is unauthenticated and authentication is enabled", () => {
        const store = getStore({authConfig: {enableAuth: true}});
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
    });

    it("does not redirect to login page when user is unauthenticated and authentication is disabled", () => {
        const store = getStore();
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockedUsedNavigate).not.toHaveBeenCalledWith("/login");
    });

    it("does not render protected routes when user is unauthenticated using access token", () => {
        const store = getStore();
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
});

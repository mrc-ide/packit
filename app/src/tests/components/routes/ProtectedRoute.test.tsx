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

describe("protected routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
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

    it("renders protected routes when user is authenticated using access token", () => {
        saveCurrentUser({token: "fakeToken"});
        const store = getStore({isAuthenticated: true});
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store);

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
            {
                type: "login/saveUser",
                payload: {token: "fakeToken"}
            });
    });

    it("does not renders protected routes when user is unauthenticated using access token", () => {
        const store = getStore({isAuthenticated: true});
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store);

        expect(mockDispatch).toHaveBeenCalledTimes(0);
    });
});

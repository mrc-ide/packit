import React from "react";
import {LoginState} from "../../../types";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {mockLoginState, mockPacketsState} from "../../mocks";
import {Store} from "@reduxjs/toolkit";
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {Login, Redirect} from "../../../app/components/login";
import {Explorer} from "../../../app/components/contents";

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
                        <Route path="/redirect" element={<Redirect/>}/>
                        <Route path="/" element={<Explorer/>}/>
                        <Route path="/login" element={<Login/>} />
                    </Routes>
                </MemoryRouter>
            </Provider>);
    };

    it("can render redirect correctly for successful login when store has not updated", () => {
        const store = getStore();
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store);
        expect(screen.getByText("Redirecting...")).toBeInTheDocument();
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({type: "login/saveUser", payload: {token: "fakeToken"}});
    });

    it("can render redirect correctly for failedlogin when store has not updated", () => {
        const store = getStore();
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store, "/redirect?error=bad token");
        expect(screen.getByText("Redirecting...")).toBeInTheDocument();
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({type: "login/loginError", payload: "bad token"});
    });

    it("can redirect for successful login when store has updated", () => {
        const store = getStore({isAuthenticated: true});
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store);
        expect(screen.getByText("Packets (0)")).toBeVisible();
        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });

    it("can redirect for failed login when store has updated", () => {
        const error = { error: "Login failed", detail: "bad token" };
        const store = getStore({ userError: { error } });
        const mockDispatch = jest.spyOn(store, "dispatch");
        renderElement(store,"/redirect?error=bad token");
        expect(screen.getByText("bad token")).toBeVisible();
        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
});

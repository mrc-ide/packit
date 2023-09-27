import React from "react";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeaderDropDown from "../../../app/components/header/HeaderDropDown";
import {LoginState} from "../../../types";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {mockLoginState} from "../../mocks";
import {Store} from "@reduxjs/toolkit";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";

describe("header drop down menu component", () => {

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
                <MemoryRouter>
                    <HeaderDropDown/>
                </MemoryRouter>
            </Provider>);
    };

    it("renders drop down menu as expected when authenticated", async () => {
        renderElement(getStore({isAuthenticated: true}))
        const dropDown = screen.getByTestId("drop-down");
        expect(dropDown).toBeInTheDocument();
        expect(screen.getByTestId("AccountCircleIcon")).toBeInTheDocument();

        expect(dropDown.className).toBe("icon-primary nav-item dropdown");

        const userIcon = dropDown.querySelectorAll("a")[0];

        await waitFor(() => {
            userEvent.click(userIcon);
        });

        expect(within(dropDown).getByText("l.ani@imperial.ac.uk")).toBeInTheDocument();
        expect(within(dropDown).getByText("Manage access")).toBeInTheDocument();
        expect(within(dropDown).getByText("Publish packets")).toBeInTheDocument();
        expect(within(dropDown).getByTestId("LogoutIcon")).toBeInTheDocument();
    });

    it("does not render drop down menu when user is not logged in", async () => {
        renderElement()
        const {queryByTestId} = screen
        expect(queryByTestId("drop-down")).toBeNull();
    });

    it("can logout authenticated user", async () => {
        const store = getStore({isAuthenticated: true})

        const mockDispatch = jest.spyOn(store, "dispatch");

        renderElement(store)

        const dropDown = screen.getByTestId("drop-down");

        const userIcon = dropDown.querySelectorAll("a")[0];

        await waitFor(() => {
            userEvent.click(userIcon);
        })

        const logoutIcon = dropDown.querySelectorAll("a")[4]

        expect(logoutIcon.textContent).toBe("Logout")

        await waitFor(() => {
            userEvent.click(logoutIcon);
        })

        expect(mockDispatch).toHaveBeenCalledTimes(1);

        expect(mockDispatch).toHaveBeenCalledWith({ type: "login/logout", payload: undefined });
    });
});

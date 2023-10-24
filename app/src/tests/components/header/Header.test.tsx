import React from "react";
import {screen, render} from "@testing-library/react";
import Header from "../../../app/components/header/Header";
import {LoginState} from "../../../types";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {mockLoginState} from "../../mocks";
import {Store} from "@reduxjs/toolkit";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";

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
                <MemoryRouter>
                    <Header/>
                </MemoryRouter>
            </Provider>);
    };

    it("renders nav brand and logo", () => {
        renderElement();
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();

        const logo = screen.getByRole("img");
        expect(logo).toHaveAttribute("src", "/img/packit-logo.png");
        expect(logo).toHaveAttribute("alt", "Logo");
    });

    it("renders navigation link and icons", () => {
        renderElement(getStore({isAuthenticated: true}));
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();

        const spans = header.querySelectorAll("span");
        expect(spans.length).toBe(3);

        const accessibilityLink = spans[0].querySelector("a");
        expect(accessibilityLink?.href).toBe("http://localhost/");
        expect(accessibilityLink).toHaveTextContent("Accessibility");

        expect(screen.getByTestId("HelpIcon")).toBeInTheDocument();
        expect(screen.getByTestId("drop-down")).toBeInTheDocument();
        expect(screen.getByTestId("AccountCircleIcon")).toBeInTheDocument();
    });

    it("can navigate to home page with brand logo", () => {
        renderElement();
        const header = screen.getByTestId("header");

        expect(header).toBeInTheDocument();

        const navBrand = header.querySelector(".navbar-brand");

        expect(navBrand).toHaveClass("navbar-brand");

        expect(navBrand).toHaveAttribute("href", "/");
    });
});

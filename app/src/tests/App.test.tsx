import React from "react";
import {render, screen} from "@testing-library/react";
import App from "../app/App";
import {Provider} from "react-redux";
import store from "../app/store/store";
import {MemoryRouter} from "react-router-dom";

describe("app component", () => {

    beforeEach(() => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <App/>
                </MemoryRouter>
            </Provider>);
    });

    it("renders packet explorer page", () => {
        const app = screen.getByTestId("app");
        expect(app).toHaveTextContent("Packets (0)");
        expect(app).toHaveTextContent("Click on a column heading to sort by field.");
        expect(app.className).toBe("default");
    });

    it("renders app header", () => {
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();
    });

    it("renders app main", () => {
        const main = screen.getByTestId("main");
        expect(main).toBeInTheDocument();
    });
});

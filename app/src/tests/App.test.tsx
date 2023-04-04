import React from "react";
import {render, screen} from "@testing-library/react";
import App from "../app/App";
import {Provider} from "react-redux";
import store from "../app/store/store";

describe("app component", () => {
    it("renders packet explorer page", () => {
        render(<Provider store={store}><App/></Provider>);
        const app = screen.getByTestId("app");
        expect(app).toHaveTextContent("Packets (0)");
        expect(app).toHaveTextContent("Click on a column heading to sort by field.");
        expect(app.className).toBe("default");
    });

    it("renders app header", () => {
        render(<Provider store={store}><App/></Provider>);
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();
    });

    it("renders app main", () => {
        render(<Provider store={store}><App/></Provider>);
        const main = screen.getByTestId("main");
        expect(main).toBeInTheDocument();
    });
});

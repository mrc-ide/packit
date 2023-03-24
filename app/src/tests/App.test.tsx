import React from "react";
import {render, screen} from "@testing-library/react";
import App from "../app/App";

describe("app component", () => {
    it("renders packet explorer page", () => {
        render(<App/>);
        const app = screen.getByTestId("app");
        expect(app).toHaveTextContent("Packet explorer page");
        expect(app.className).toBe("default");
    });

    it("renders app header", () => {
        render(<App/>);
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();
    });

    it("renders app main", () => {
        render(<App/>);
        const main = screen.getByTestId("main");
        expect(main).toBeInTheDocument();
    });
});

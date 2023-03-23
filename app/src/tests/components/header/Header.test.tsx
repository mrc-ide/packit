import React from "react";
import {screen, render} from "@testing-library/react";
import Header from "../../../app/components/header/Header";

describe("header component", () => {

    it("renders nav brand and logo", () => {
        render(<Header/>);
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();

        const logo = screen.getByRole("img");
        expect(logo).toHaveAttribute("src", "img/packit-logo.png");
        expect(logo).toHaveAttribute("alt", "Logo");
    });

    it("renders navigation link and icons", () => {
        render(<Header/>);
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();

        const spans = header.querySelectorAll("span");
        expect(spans.length).toBe(3);

        const accessibilityLink = spans[0].querySelector("a");
        expect(accessibilityLink?.href).toBe("http://localhost/#");
        expect(accessibilityLink).toHaveTextContent("Accessibility");

        expect(screen.getByTestId("HelpIcon")).toBeInTheDocument();
        expect(screen.getByTestId("drop-down")).toBeInTheDocument();
        expect(screen.getByTestId("AccountCircleIcon")).toBeInTheDocument();
    });

    it("can navigate to home page with brand logo", () => {
        render(<Header/>);
        const header = screen.getByTestId("header");
        const navBrand = header.querySelectorAll("a")[0];
        expect(navBrand.className).toBe("navbar-brand");
        expect(navBrand.href).toBe("http://localhost/");
    });
});

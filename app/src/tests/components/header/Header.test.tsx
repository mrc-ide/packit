import React from "react";
import {screen, render} from "@testing-library/react";
import Header from "../../../app/components/header/Header";

describe("header component", () => {

    beforeEach(() => {
        render(<Header />);
    });

    it("renders nav brand and logo", () => {
        const header = screen.getByTestId("header");
        expect(header).toBeInTheDocument();

        const logo = screen.getByRole("img");
        expect(logo).toHaveAttribute("src", "/img/packit-logo.png");
        expect(logo).toHaveAttribute("alt", "Logo");
    });

    it("renders navigation link and icons", () => {
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
        const header = screen.getByTestId("header");

        expect(header).toBeInTheDocument();

        const navBrand = header.querySelector(".navbar-brand");

        expect(navBrand).toHaveClass("navbar-brand");

        expect(navBrand).toHaveAttribute("href", "/");
    });
});

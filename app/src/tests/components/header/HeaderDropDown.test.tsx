import React from "react";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeaderDropDown from "../../../app/components/header/HeaderDropDown";

describe("header drop down menu component", () => {

    it("renders drop down menu as expected", async () => {
        render(<HeaderDropDown/>);
        const dropDown = screen.getByTestId("drop-down");
        expect(dropDown).toBeInTheDocument();
        expect(screen.getByTestId("AccountCircleIcon")).toBeInTheDocument();

        expect(dropDown.className).toBe("icon-primary nav-item dropdown");

        const userIcon = dropDown.querySelector("a")!!;

        await waitFor(() => {
            userEvent.click(userIcon);
        });

        expect(within(dropDown).getByText("l.ani@imperial.ac.uk")).toBeInTheDocument();
        expect(within(dropDown).getByText("Manage access")).toBeInTheDocument();
        expect(within(dropDown).getByText("Publish packets")).toBeInTheDocument();
        expect(within(dropDown).getByTestId("LogoutIcon")).toBeInTheDocument();
    });

});

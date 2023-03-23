import React from "react";
import {screen, render, waitFor, within} from "@testing-library/react";
import {Sidebar} from "../../../app/components/main";
import userEvent from "@testing-library/user-event";
import {SideBarItems} from "../../../app/types";

describe("main component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders skeleton div", async () => {
        const workflowPage = SideBarItems.workflowRunner;
        const mockHandleSelected = jest.fn().mockImplementation((data) => data);
        render(<Sidebar onChangeSideBar={() => mockHandleSelected(workflowPage)}/>);
        const sidebar = screen.getByTestId("sidebar");
        const list = sidebar.querySelectorAll("li a");

        await waitFor(() => {
            userEvent.click(list[1]);
        });

        expect(mockHandleSelected).toHaveBeenCalled();

        expect(mockHandleSelected).toHaveBeenCalledWith(workflowPage);
    });
});

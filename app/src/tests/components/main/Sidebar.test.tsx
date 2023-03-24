import React from "react";
import {screen, render, waitFor} from "@testing-library/react";
import {Sidebar} from "../../../app/components/main";
import userEvent from "@testing-library/user-event";
import {SideBarItems} from "../../../app/types";

describe("sidebar component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockHandleSelected = jest.fn().mockImplementation((data) => data);

    it("renders sidebar items", () => {
        render(<Sidebar onChangeSideBar={() => mockHandleSelected(0)}/>);
        const app = screen.getByTestId("sidebar");
        const items = app.querySelectorAll("li a");
        expect(items.length).toBe(4);

        expect(items[0]).toHaveTextContent("Packet explorer");
        expect(items[0].className).toBe("active");

        expect(items[1]).toHaveTextContent("Packet runner");
        expect(items[1].className).toBe("");

        expect(items[2]).toHaveTextContent("Workflow runner");
        expect(items[2].className).toBe("");

        expect(items[3]).toHaveTextContent("Project documentation");
        expect(items[3].className).toBe("");

        expect(app).toHaveTextContent("Packet explorer");
    });

    it("can navigate to packet runner page from sidebar", async () => {
        await expectSidebarItemIsSelected(SideBarItems.packetRunner);
    });

    it("can navigate to packet explorer page from sidebar", async () => {
        await expectSidebarItemIsSelected(SideBarItems.explorer);
    });

    it("can navigate to workflow page from sidebar", async () => {
        await expectSidebarItemIsSelected(SideBarItems.workflowRunner);
    });

    it("can navigate to project doc page from sidebar", async () => {
        await expectSidebarItemIsSelected(SideBarItems.projectDoc);
    });
});

const expectSidebarItemIsSelected = async (itemIndex: SideBarItems) => {

    const mockHandleSelected = jest.fn().mockImplementation((data) => data);

    render(<Sidebar onChangeSideBar={(e) => mockHandleSelected(e)}/>);

    const sidebar = screen.getByTestId("sidebar");

    const list = sidebar.querySelectorAll("li a");

    expect(list.length).toBe(4);

    if (itemIndex !== 0) {
        expect(list[itemIndex].className).toBe("");
    }

    await waitFor(() => {
        userEvent.click(list[itemIndex]);
    });

    expect(list[itemIndex].className).toBe("active");

    expect(mockHandleSelected).toHaveBeenCalled();

    expect(mockHandleSelected).toHaveBeenCalledWith(itemIndex);
};

import React from "react";
import {render, screen, waitFor, within} from "@testing-library/react";
import {Main} from "../../../app/components/main";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {PacketsState, SideBarItems} from "../../../types";
import {mockPacketResponse, mockPacketsState} from "../../mocks";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";

describe("main component", () => {

    const getStore = (props: Partial<PacketsState> = {}) => {
        const middlewares = [thunk];
        const mockStore = configureStore(middlewares);
        const initialRootStates = {
            packets: mockPacketsState(props)
        };

        return mockStore(initialRootStates);
    };

    it("renders sidebar", () => {
        const store = getStore();
        render(<Provider store={store}><Main/></Provider>);
        const sidebar = screen.getByTestId("sidebar");
        expect(sidebar).toBeInTheDocument();
        const list = sidebar.querySelectorAll("li a");
        expect(list.length).toBe(4);
    });

    it("renders active content", () => {
        const store = getStore();
        render(<Provider store={store}><Main/></Provider>);
        const content = screen.getByTestId("content");
        expect(content).toBeInTheDocument();
        expect(content).toHaveTextContent("Packets (0)");
        expect(content).toHaveTextContent("Click on a column heading to sort by field.");
    });

    it("renders packet explorer page", () => {
        const store = getStore();
        render(<Provider store={store}><Main/></Provider>);
        expect(screen.getByTestId("explorer")).toBeInTheDocument();
        expect(screen.queryByTestId("packet-runner")).toBeNull();
        expect(screen.queryByTestId("workflow-runner")).toBeNull();
        expect(screen.queryByTestId("project-documentation")).toBeNull();
    });

    it("renders packet runner page", async () => {
        const store = getStore({
            activeSideBar: SideBarItems.packetRunner,
            packet: mockPacketResponse
        });
        render(<Provider store={store}><Main/></Provider>);
        const mainComponent = screen.getByTestId("main");
        const items = mainComponent.querySelectorAll("li a");
        expect(items.length).toBe(4);
        const packetRunner = items[1];
        expect(packetRunner).toHaveTextContent("Packet runner");
        expect((packetRunner as HTMLLinkElement).href).toBe("http://localhost/#");

        await waitFor(() => {
            userEvent.click(packetRunner);
        });
        expect(within(mainComponent).getByText("Packet runner page")).toBeInTheDocument();
    });

    it("renders workflow runner page", async () => {
        const store = getStore({
            activeSideBar: SideBarItems.workflowRunner,
            packet: mockPacketResponse
        });
        render(<Provider store={store}><Main/></Provider>);
        const mainComponent = screen.getByTestId("main");
        const items = mainComponent.querySelectorAll("li a");
        expect(items.length).toBe(4);
        const workflowRunner = items[2];
        expect(workflowRunner).toHaveTextContent("Workflow runner");
        expect((workflowRunner as HTMLLinkElement).href).toBe("http://localhost/#");

        await waitFor(() => {
            userEvent.click(workflowRunner);
        });

        expect(within(mainComponent).getByText("Workflow runner page")).toBeInTheDocument();
    });

    it("renders project documentation page", async () => {
        const store = getStore({
            activeSideBar: SideBarItems.projectDoc,
            packet: mockPacketResponse
        });
        render(<Provider store={store}><Main/></Provider>);
        const mainComponent = screen.getByTestId("main");
        const items = mainComponent.querySelectorAll("li a");
        expect(items.length).toBe(4);
        const projectDoc = items[3];
        expect(projectDoc).toHaveTextContent("Project documentation");
        expect((projectDoc as HTMLLinkElement).href).toBe("http://localhost/#");

        await waitFor(() => {
            userEvent.click(projectDoc);
        });

        expect(within(mainComponent).getByText("Project documentation page")).toBeInTheDocument();
    });
});

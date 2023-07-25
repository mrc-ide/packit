import React from "react";
import {render, screen, waitFor, within} from "@testing-library/react";
import {Main} from "../../../app/components/main";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {PacketsState} from "../../../types";
import {mockPacketResponse, mockPacketsState} from "../../mocks";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {Store} from "@reduxjs/toolkit";
import {MemoryRouter} from "react-router-dom";

describe("main component", () => {

    const getStore = (props: Partial<PacketsState> = {}) => {
        const middlewares = [thunk];
        const mockStore = configureStore(middlewares);
        const initialRootStates = {
            packets: mockPacketsState(props)
        };

        return mockStore(initialRootStates);
    };

    const renderElement = (store: Store = getStore()) => {
        return render(
            <Provider store={store}>
                <MemoryRouter>
                    <Main/>
                </MemoryRouter>
            </Provider>);
    };

    it("renders sidebar", () => {
        renderElement();
        const sidebar = screen.getByTestId("sidebar");
        expect(sidebar).toBeInTheDocument();
        const list = sidebar.querySelectorAll("li a");
        expect(list.length).toBe(4);
    });
    it("renders active content", () => {
        renderElement();
        const content = screen.getByTestId("content");
        expect(content).toBeInTheDocument();
        expect(content).toHaveTextContent("Packets (0)");
        expect(content).toHaveTextContent("Click on a column heading to sort by field.");
    });

    it("renders packet explorer page", () => {
        renderElement();
        expect(screen.getByTestId("explorer")).toBeInTheDocument();
        expect(screen.queryByTestId("packet-runner")).toBeNull();
        expect(screen.queryByTestId("workflow-runner")).toBeNull();
        expect(screen.queryByTestId("project-documentation")).toBeNull();
    });

    it("renders packet runner page", async () => {
        const store = getStore({
            packet: mockPacketResponse
        });
        renderElement(store);
        const mainComponent = screen.getByTestId("main");
        const sidebar = screen.getByTestId("sidebar");
        const items = sidebar.querySelectorAll("li a");
        expect(items.length).toBe(4);
        const packetRunner = items[1];
        expect(packetRunner).toHaveTextContent("Packet runner");
        expect((packetRunner as HTMLLinkElement).href).toBe("http://localhost/run");

        await waitFor(() => {
            userEvent.click(packetRunner);
        });
        expect(within(mainComponent).getByText("Packet runner page")).toBeInTheDocument();
    });

    it("renders workflow runner page", async () => {
        const store = getStore({
            packet: mockPacketResponse
        });
        renderElement(store);
        const mainComponent = screen.getByTestId("main");
        const sidebar = screen.getByTestId("sidebar");
        const items = sidebar.querySelectorAll("li a");
        expect(items.length).toBe(4);
        const workflowRunner = items[2];
        expect(workflowRunner).toHaveTextContent("Workflow runner");
        expect((workflowRunner as HTMLLinkElement).href).toBe("http://localhost/run-workflow");

        await waitFor(() => {
            userEvent.click(workflowRunner);
        });

        expect(within(mainComponent).getByText("Workflow runner page")).toBeInTheDocument();
    });

    it("renders project documentation page", async () => {
        const store = getStore({
            packet: mockPacketResponse
        });
        renderElement(store);
        const mainComponent = screen.getByTestId("main");
        const sidebar = screen.getByTestId("sidebar");
        const items = sidebar.querySelectorAll("li a");
        expect(items.length).toBe(4);
        const projectDoc = items[3];
        expect(projectDoc).toHaveTextContent("Project documentation");
        expect((projectDoc as HTMLLinkElement).href).toBe("http://localhost/documentation");

        await waitFor(() => {
            userEvent.click(projectDoc);
        });

        expect(within(mainComponent).getByText("Project documentation page")).toBeInTheDocument();
    });
});

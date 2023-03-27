import React from "react";
import {screen, render, within, waitFor} from "@testing-library/react";
import {Main} from "../../../app/components/main";
import userEvent from "@testing-library/user-event";
import store from "../../../app/store/store";
import {Provider} from "react-redux";

describe("main component", () => {
    it("renders sidebar", () => {
        render(<Provider store={store}><Main/></Provider>);
        const sidebar = screen.getByTestId("sidebar");
        expect(sidebar).toBeInTheDocument();
        const list = sidebar.querySelectorAll("li a");
        expect(list.length).toBe(4);
    });

    it("renders active content", () => {
        render(<Provider store={store}><Main/></Provider>);
        const content = screen.getByTestId("content");
        expect(content).toBeInTheDocument();
        expect(content).toHaveTextContent("Packets (0)");
        expect(content).toHaveTextContent("Click on a column heading to sort by field.");
    });

    it("renders packet runner page", async () => {
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

import React from "react";
import {screen, render, within, waitFor} from "@testing-library/react";
import {Main} from "../../../app/components/main";
import userEvent from "@testing-library/user-event";

describe("main component", () => {
    it("renders sidebar", () => {
        render(<Main/>);
        const sidebar = screen.getByTestId("sidebar");
        expect(sidebar).toBeInTheDocument();
        const list = sidebar.querySelectorAll("li a");
        expect(list.length).toBe(4);
    });

    it("renders active content", () => {
        render(<Main/>);
        const content = screen.getByTestId("content");
        expect(content).toBeInTheDocument();
        expect(content).toHaveTextContent("Packet explorer page");
    });

    it("renders sidebar items", () => {
        render(<Main/>);
        const app = screen.getByTestId("sidebar");
        const items = app.querySelectorAll("li a");
        expect(items.length).toBe(4);
        expect(items[0]).toHaveTextContent("Packet explorer");
        expect(items[1]).toHaveTextContent("Packet runner");
        expect(items[2]).toHaveTextContent("Workflow runner");
        expect(items[3]).toHaveTextContent("Project documentation");
        expect(app).toHaveTextContent("Packet explorer");
    });

    it("renders packet runner page", async () => {
        render(<Main/>);
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
        render(<Main/>);
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
        render(<Main/>);
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

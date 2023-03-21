import React from "react";
import {render, screen, waitFor, within} from "@testing-library/react";
import App from "../app/App";
import userEvent from "@testing-library/user-event";

describe("app component", () => {
    it("renders packet explorer page", () => {
        render(<App/>);
        const app = screen.getByTestId("app-id");
        expect(app).toHaveTextContent("Packet explorer page");
        expect(app.className).toBe("default");
    });

    it("renders sidebar items", () => {
        render(<App/>);
        const app = screen.getByTestId("app-id");
        const items = app.querySelectorAll("li a");
        expect(items.length).toBe(4)
        expect(items[0]).toHaveTextContent("Packet explorer")
        expect(items[1]).toHaveTextContent("Packet runner")
        expect(items[2]).toHaveTextContent("Workflow runner")
        expect(items[3]).toHaveTextContent("Project documentation")
        expect(app).toHaveTextContent("Packet explorer");
    });

    it("renders packet runner page", async () => {
        render(<App/>);
        const mainComponent = screen.getByTestId("main-id");
        const items = mainComponent.querySelectorAll("li a");
        expect(items.length).toBe(4)
        const packetRunner = items[1]
        expect(packetRunner).toHaveTextContent("Packet runner")
        expect((packetRunner as HTMLLinkElement).href).toBe("http://localhost/#")

        await waitFor(() => {
            userEvent.click(packetRunner);
        });

        expect(within(mainComponent).getByText("Packet runner page")).toBeInTheDocument();
    });

    it("renders workflow runner page", async () => {
        render(<App/>);
        const mainComponent = screen.getByTestId("main-id");
        const items = mainComponent.querySelectorAll("li a");
        expect(items.length).toBe(4)
        const workflowRunner = items[2]
        expect(workflowRunner).toHaveTextContent("Workflow runner")
        expect((workflowRunner as HTMLLinkElement).href).toBe("http://localhost/#")

        await waitFor(() => {
            userEvent.click(workflowRunner);
        });

        expect(within(mainComponent).getByText("Workflow runner page")).toBeInTheDocument();
    });

    it("renders project documentation page", async () => {
        render(<App/>);
        const mainComponent = screen.getByTestId("main-id");
        const items = mainComponent.querySelectorAll("li a");
        expect(items.length).toBe(4)
        const projectDoc = items[3]
        expect(projectDoc).toHaveTextContent("Project documentation")
        expect((projectDoc as HTMLLinkElement).href).toBe("http://localhost/#")

        await waitFor(() => {
            userEvent.click(projectDoc);
        });

        expect(within(mainComponent).getByText("Project documentation page")).toBeInTheDocument();
    });
})

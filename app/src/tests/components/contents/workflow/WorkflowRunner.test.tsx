import React from "react";
import {render, screen} from "@testing-library/react";
import {WorkflowRunner} from "../../../../app/components/contents";
import {MemoryRouter} from "react-router-dom";

describe("workflow runner component", () => {
    it("renders skeleton text", async () => {
        render(<MemoryRouter><WorkflowRunner/></MemoryRouter>);

        const content = await screen.findByText("Workflow runner page");

        expect(content).toBeInTheDocument();
    });
});

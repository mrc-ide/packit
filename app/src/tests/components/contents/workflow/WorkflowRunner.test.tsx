import React from "react";
import {render, screen} from "@testing-library/react";
import {WorkflowRunner} from "../../../../app/components/contents";

describe("workflow runner component", () => {
    it("renders skeleton text", async () => {
        render(<WorkflowRunner/>);

        const content = await screen.findByText("Workflow runner page");

        expect(content).toBeInTheDocument();
    });
});

import React from "react";
import {render} from "@testing-library/react";
import {WorkflowRunner} from "../../../../app/components/contents";

describe("workflow runner component", () => {
    it("renders skeleton text", () => {
        const {container} = render(<WorkflowRunner/>);

        expect(container).toHaveTextContent("Workflow runner page");
    });
});

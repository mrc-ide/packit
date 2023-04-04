import React from "react";
import {render, screen} from "@testing-library/react";
import {ProjectDocumentation} from "../../../../app/components/contents";

describe("project documentation component", () => {
    it("renders skeleton div", async () => {
        render(<ProjectDocumentation/>);

        const content = await screen.findByText("Project documentation page");

        expect(content).toBeInTheDocument();
    });
});

import React from "react";
import {render, screen} from "@testing-library/react";
import {ProjectDocumentation} from "../../../../app/components/contents";
import {MemoryRouter} from "react-router-dom";

describe("project documentation component", () => {
    it("renders skeleton div", async () => {
        render(<MemoryRouter><ProjectDocumentation/></MemoryRouter>);

        const content = await screen.findByText("Project documentation page");

        expect(content).toBeInTheDocument();
    });
});

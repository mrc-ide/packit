import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {Metadata} from "../../../../app/components/contents";
import React from "react";

describe("Metadata component", () => {
    it("renders skeleton div", async () => {
        render(<MemoryRouter><Metadata/></MemoryRouter>);

        const content = await screen.findByText("Metadata page");

        expect(content).toBeInTheDocument();
    });
});

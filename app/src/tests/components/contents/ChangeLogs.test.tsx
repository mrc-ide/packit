import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {ChangeLogs} from "../../../app/components/contents";
import React from "react";

describe("Changelogs component", () => {
    it("renders skeleton div", async () => {
        render(<MemoryRouter><ChangeLogs/></MemoryRouter>);

        const content = await screen.findByText("Changelogs page");

        expect(content).toBeInTheDocument();
    });
});

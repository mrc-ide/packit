import React from "react";
import {render, screen} from "@testing-library/react";
import {PacketRunner} from "../../../../app/components/contents";

describe("packet runner component", () => {
    it("renders skeleton text", async () => {
        render(<PacketRunner/>);

        const content = await screen.findByText("Packet runner page");

        expect(content).toBeInTheDocument();
    });
});

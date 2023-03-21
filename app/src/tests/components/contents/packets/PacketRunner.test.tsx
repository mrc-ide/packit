import React from "react";
import {render} from "@testing-library/react";
import {PacketRunner} from "../../../../app/components/contents";

describe("packet runner component", () => {
    it("renders skeleton text", () => {
        const {container} = render(<PacketRunner/>)

        expect(container).toHaveTextContent("Packet runner page");
    })
})

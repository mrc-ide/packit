import React from "react";
import {render} from "@testing-library/react";
import {Explorer} from "../../../../app/components/contents";

describe("packet explorer component", () => {
    it("renders skeleton div", () => {
        const {container} = render(<Explorer/>)

        expect(container).toHaveTextContent("Packet explorer page");
    })
})

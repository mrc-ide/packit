import React from "react";
import {render} from "@testing-library/react";
import {ProjectDocumentation} from "../../../../app/components/contents";

describe("project documentation component", () => {
    it("renders skeleton div", () => {
        const {container} = render(<ProjectDocumentation/>)

        expect(container).toHaveTextContent("Project documentation pag");
    })
})

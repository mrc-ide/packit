import React from "react";
import {render, screen} from "@testing-library/react";
import {Explorer} from "../../../../app/components/contents";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {mockPacketsState, mockPacketResponse} from "../../../mocks";
import {PacketsState} from "../../../../app/types";

describe("packet explorer component", () => {
    const getStore = (props: Partial<PacketsState> = {packets: [mockPacketResponse]}) => {
        const mockStore = configureStore();

        const initialRootStates = {
            packets: mockPacketsState(props)
        };

        return mockStore(initialRootStates);
    };

    it("renders component as expected", () => {
        const store = getStore();

        const {container} = render(<Provider store={store}> <Explorer/></Provider>);

        expect(container).toHaveTextContent("Packets (1)");

        expect(container).toHaveTextContent("Click on a column heading to sort by field.");
    });

    it("renders packet explorer table as expected", () => {
        const store = getStore();

        render(<Provider store={store}> <Explorer/></Provider>);

        const table = screen.getByTestId("table");

        expect(table).toBeVisible();

        const rows = screen.getAllByRole("row");

        expect(rows).toHaveLength(2);
    });

    it("renders skeleton pagination content as expected", () => {
        const store = getStore();

        render(<Provider store={store}> <Explorer/></Provider>);

        const paginationContent = screen.getByTestId("pagination-content");

        expect(paginationContent).toBeVisible();

        expect(paginationContent).toHaveTextContent("Show");

        const select = paginationContent.querySelector("select") as HTMLSelectElement;

        expect(select).toHaveLength(4);

        expect(select).toHaveTextContent("10");

        expect(paginationContent).toHaveTextContent("entries");
    });
});

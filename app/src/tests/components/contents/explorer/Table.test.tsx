import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {Explorer} from "../../../../app/components/contents";
import React from "react";
import {mockPacketResponse, mockPacketsState} from "../../../mocks";
import {PacketsState} from "../../../../types";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

describe("table component", () => {

    const packets = [{
        id: "52fd88b2-8ee8-4ac0-a0e5-41b9a15554a4",
        name: "Interim update for covid impact iu",
        displayName: "",
        parameters: {
            "city_subset": "63f730b9fc13ae1df6000070"
        },
        published: true
    }];

    const getStore = (props: Partial<PacketsState> = {}) => {

        const middlewares = [thunk];

        const mockStore = configureStore(middlewares);

        const initialRootStates = {
            packets: mockPacketsState(props)
        };

        return mockStore(initialRootStates);
    };

    it("render packet explorer table as expected", () => {
        const store = getStore({packets: [mockPacketResponse]});

        render(<Provider store={store}> <Explorer/></Provider>);

        const table = screen.getByTestId("table");

        expect(table).toBeVisible();

        const rows = screen.getAllByRole("row");

        expect(rows).toHaveLength(2);

        // assert table header names
        const tableHeader = screen.getAllByRole("columnheader");
        expect(tableHeader).toHaveLength(4);
        expect(tableHeader[0]).toHaveTextContent("Name");
        expect(tableHeader[1]).toHaveTextContent("Version");
        expect(tableHeader[2]).toHaveTextContent("Status");
        expect(tableHeader[3]).toHaveTextContent("Parameters");

        // assert table cells
        const tableCells = screen.getAllByRole("cell");
        expect(tableCells).toHaveLength(4);
        expect(tableCells[0]).toHaveTextContent(mockPacketResponse.displayName);
        expect(tableCells[1]).toHaveTextContent(mockPacketResponse.id);
        expect(tableCells[2]).toHaveTextContent("internal");

        //assert params
        const paramsSelectors = tableCells[3].querySelectorAll("ul li");
        const params = `${Object.keys(mockPacketResponse.parameters)}=${mockPacketResponse.parameters.city_subset}`;
        expect(paramsSelectors).toHaveLength(1);
        expect(paramsSelectors[0]).toHaveTextContent(params);

        //badge
        expect(tableCells[2]).toHaveTextContent("internal");
        expect(tableCells[2].querySelector("span")).toHaveClass("badge badge-internal");
    });

    it("renders packet name when displayName is empty", () => {
        const store = getStore({packets});

        render(<Provider store={store}> <Explorer/></Provider>);

        const table = screen.getByTestId("table");

        expect(table).toBeVisible();

        // assert table cells
        const tableCells = screen.getAllByRole("cell");
        expect(tableCells).toHaveLength(4);
        expect(tableCells[0]).toHaveTextContent(packets[0].name);
    });

    it("renders published badge when a packet is published", () => {
        const store = getStore({packets});

        render(<Provider store={store}> <Explorer/></Provider>);

        const table = screen.getByTestId("table");

        expect(table).toBeVisible();

        //assert badge
        const tableCells = screen.getAllByRole("cell");
        expect(tableCells).toHaveLength(4);
        expect(tableCells[2]).toHaveTextContent("published");
        expect(tableCells[2].querySelector("span")).toHaveClass("badge badge-published");
    });
});

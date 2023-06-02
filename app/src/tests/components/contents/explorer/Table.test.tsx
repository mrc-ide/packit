import {fireEvent, render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {Table} from "../../../../app/components/contents/explorer";
import React from "react";
import {mockPacketsState} from "../../../mocks";
import {PacketsState} from "../../../../types";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

describe("table component", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockSelectedSideBar = jest.fn().mockImplementation((data) => data);

    const packets = [
        {
            id: "52fd88b2-8ee8-4ac0-a0e5-41b9a15554a4",
            name: "packet 1",
            displayName: "",
            parameters: {
                "city_subset": "63f730b9fc13ae1df6000070"
            },
            published: true
        },
        {
            id: "52fd88b2",
            name: "Terminal",
            displayName: "packet 2",
            parameters: {
                "city_subset": "63f730b9fc13ae1df6000070"
            },
            published: false
        },
        {
            id: "541b9a15554a4",
            name: "Zimbabwe",
            displayName: "packet 3",
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

    it("render table as expected", () => {
        const store = getStore();

        render(<Provider store={store}> <Table data={packets} setSelectedBarItem={mockSelectedSideBar()}/></Provider>);

        const table = screen.getByTestId("table");

        expect(table).toBeVisible();

        const rows = screen.getAllByRole("row");

        expect(rows).toHaveLength(4);

        // assert table header names
        const tableHeader = screen.getAllByRole("columnheader");
        expect(tableHeader).toHaveLength(4);
        expect(tableHeader[0]).toHaveTextContent("Name");
        expect(tableHeader[1]).toHaveTextContent("Version");
        expect(tableHeader[2]).toHaveTextContent("Status");
        expect(tableHeader[3]).toHaveTextContent("Parameters");

        // assert table cells
        const tableCells = screen.getAllByRole("cell");
        expect(tableCells).toHaveLength(12);
        expect(tableCells[0]).toHaveTextContent(packets[0].name);
        expect(tableCells[1]).toHaveTextContent(packets[0].id);
        expect(tableCells[2]).toHaveTextContent("published");

        //assert params
        const paramsSelectors = tableCells[3].querySelectorAll("ul li");
        const params = `${Object.keys(packets[0].parameters)}=${packets[0].parameters.city_subset}`;
        expect(paramsSelectors).toHaveLength(1);
        expect(paramsSelectors[0]).toHaveTextContent(params);

        //badge
        expect(tableCells[2]).toHaveTextContent("published");
        expect(tableCells[2].querySelector("span")).toHaveClass("badge badge-published");
    });

    it("renders packet name when displayName is empty", () => {
        const store = getStore();

        render(<Provider store={store}> <Table data={packets} setSelectedBarItem={mockSelectedSideBar()}/></Provider>);

        const table = screen.getByTestId("table");

        expect(table).toBeVisible();

        // assert table cells
        const tableCells = screen.getAllByRole("cell");
        expect(tableCells).toHaveLength(12);
        expect(tableCells[0]).toHaveTextContent(packets[0].name);
    });

    it("renders published badge when a packet is published", () => {
        const store = getStore({packets});

        render(<Provider store={store}> <Table data={packets} setSelectedBarItem={mockSelectedSideBar()}/></Provider>);

        const table = screen.getByTestId("table");

        expect(table).toBeVisible();

        //assert badge
        const tableCells = screen.getAllByRole("cell");
        expect(tableCells).toHaveLength(12);
        expect(tableCells[2]).toHaveTextContent("published");
        expect(tableCells[2].querySelector("span")).toHaveClass("badge badge-published");
    });

    it("can sort data by name header as expected", () => {
        const store = getStore();

        render(<Provider store={store}> <Table data={packets} setSelectedBarItem={mockSelectedSideBar()}/></Provider>);

        const {getByText} = screen;

        const nameHeader = getByText("Name");

        const rows = screen.getAllByRole("row");

        //unsorted list
        expect(rows[2].querySelectorAll("td")[0]).toHaveTextContent("packet 2");
        expect(rows[1].querySelectorAll("td")[0]).toHaveTextContent("packet 1");
        expect(rows[3].querySelectorAll("td")[0]).toHaveTextContent("packet 3");

        //sorted ascending
        fireEvent.click(nameHeader);
        expect(rows[1].querySelectorAll("td")[0]).toHaveTextContent("packet 1");
        expect(rows[2].querySelectorAll("td")[0]).toHaveTextContent("packet 2");
        expect(rows[3].querySelectorAll("td")[0]).toHaveTextContent("packet 3");

        //sorted descending
        fireEvent.click(nameHeader);
        expect(rows[1].querySelectorAll("td")[0]).toHaveTextContent("packet 3");
        expect(rows[2].querySelectorAll("td")[0]).toHaveTextContent("packet 2");
        expect(rows[3].querySelectorAll("td")[0]).toHaveTextContent("packet 1");
    });

    it("can sort data by status header as expected", async () => {
        const store = getStore();

        render(<Provider store={store}> <Table data={packets} setSelectedBarItem={mockSelectedSideBar()}/></Provider>);

        const {getByText} = screen;

        const statusHeader = getByText("Status");

        const rows = screen.getAllByRole("row");

        expect(rows[1].querySelectorAll("td")[2]).toHaveTextContent("published");
        expect(rows[2].querySelectorAll("td")[2]).toHaveTextContent("internal");
        expect(rows[3].querySelectorAll("td")[2]).toHaveTextContent("published");

        fireEvent.click(statusHeader);

        expect(rows[1].querySelectorAll("td")[2]).toHaveTextContent("internal");
        expect(rows[2].querySelectorAll("td")[2]).toHaveTextContent("published");
        expect(rows[3].querySelectorAll("td")[2]).toHaveTextContent("published");
    });
});

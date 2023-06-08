import React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import {Explorer} from "../../../../app/components/contents";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {mockPacketsState, mockPacketResponse} from "../../../mocks";
import {PacketsState} from "../../../../types";
import thunk from "redux-thunk";

describe("packet explorer component", () => {

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    const getStore = (props: Partial<PacketsState> = {packets: [mockPacketResponse]}) => {
        const middlewares = [thunk];
        const mockStore = configureStore(middlewares);
        const initialRootStates = {
            packets: mockPacketsState(props)
        };

        return mockStore(initialRootStates);
    };

    it("it should render component as expected", () => {
        const store = getStore();

        const mockDispatch = jest.spyOn(store, "dispatch");

        render(<Provider store={store}> <Explorer/></Provider>);

        expect(screen.getByText("Packets (1)")).toBeVisible();

        expect(screen.getByText("Click on a column heading to sort by field.")).toBeVisible();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("dispatches actions when packed detail page", () => {
        const store = getStore();

        const mockDispatch = jest.spyOn(store, "dispatch");

        render(<Provider store={store}> <Explorer/></Provider>);

        const firstCell = screen.getByText("touchstone");

        fireEvent.click(firstCell);

        expect(mockDispatch).toHaveBeenCalledTimes(3);
        expect(mockDispatch.mock.calls[2][0]).toEqual({
            payload: 1,
            type: "packets/setActiveSideBar"
        });
    });

    it("it should render component as expected", () => {
        const store = getStore();

        render(<Provider store={store}> <Explorer/></Provider>);

        expect(screen.getByText("Packets (1)")).toBeVisible();

        expect(screen.getByText("Click on a column heading to sort by field.")).toBeVisible();
    });

    it("should render packet explorer table as expected", () => {
        const store = getStore();

        render(<Provider store={store}> <Explorer/></Provider>);

        const { getByTestId, getAllByRole } = screen;

        expect(getByTestId("table")).toBeVisible();

        expect(getAllByRole("row")).toHaveLength(2);
    });

    it("should render skeleton pagination content as expected", () => {
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

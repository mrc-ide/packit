import React from "react";
import {render, screen} from "@testing-library/react";
import {Explorer} from "../../../../app/components/contents";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {mockPacketsState, mockPacketResponse} from "../../../mocks";
import {PacketsState} from "../../../../types";
import thunk from "redux-thunk";

describe("packet explorer component", () => {

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

    it("should dispatch an action when the user clicks on a sortable column header", () => {
        const store = getStore();

        const spy = jest.spyOn(store, "dispatch");

        const spyOnConsole = jest.spyOn(console, "log");

        render(<Provider store={store}><Explorer /></Provider>);

        const { getByText } = screen;

        getByText("Name").click();

        expect(spy).toHaveBeenCalledTimes(1);

        expect(spy).toHaveBeenCalledWith(expect.any(Function));

        expect(spyOnConsole).toHaveBeenCalledTimes(1);

        expect(spyOnConsole).toHaveBeenCalledWith("We shall implement sort by name");
    });
});

import React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import {Explorer} from "../../../../app/components/contents";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {mockPacketsState, mockPacketResponse} from "../../../mocks";
import {PacketsState, PageablePackets} from "../../../../types";
import thunk from "redux-thunk";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {Store} from "@reduxjs/toolkit";
import PacketDetails from "../../../../app/components/contents/packets/PacketDetails";

describe("packet explorer component", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getStore = (props: Partial<PacketsState> = {packets: [mockPacketResponse]}) => {
        const middlewares = [thunk];
        const mockStore = configureStore(middlewares);
        const initialRootStates = {
            packets: mockPacketsState(props)
        };

        return mockStore(initialRootStates);
    };

    const renderElement = (store: Store = getStore()) => {
        return render(
            <Provider store={store}>
                <MemoryRouter initialEntries={["/"]}>
                    <Explorer/>
                </MemoryRouter>
            </Provider>);
    };

    it("it should render component as expected", () => {
        const store = getStore();

        const mockDispatch = jest.spyOn(store, "dispatch");

        renderElement(store);

        expect(screen.getByText("Packets (1)")).toBeVisible();

        expect(screen.getByText("Click on a column heading to sort by field.")).toBeVisible();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it("dispatches actions when packed detail page", () => {
        const store = getStore();

        const mockDispatch = jest.spyOn(store, "dispatch");

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={["/"]}>
                    <Routes>
                        <Route path="/" element={<Explorer/>} />
                        <Route path="/packets/:packetId" element={<PacketDetails />} />
                    </Routes>
                </MemoryRouter>
            </Provider>);

        expect(mockDispatch).toHaveBeenCalledTimes(1);

        const firstCell = screen.getByText("touchstone");

        fireEvent.click(firstCell);

        expect((firstCell as HTMLLinkElement).href)
            .toBe("http://localhost/packets/52fd88b2-8ee8-4ac0-a0e5-41b9a15554a4");

        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });

    it("it should render component as expected", () => {
        renderElement();

        expect(screen.getByText("Packets (1)")).toBeVisible();

        expect(screen.getByText("Click on a column heading to sort by field.")).toBeVisible();
    });

    it("should render packet explorer table as expected", () => {
        renderElement();

        const { getByTestId, getAllByRole } = screen;

        expect(getByTestId("table")).toBeVisible();

        expect(getAllByRole("row")).toHaveLength(2);
    });

    it("should render jump to page as expected", () => {
        renderElement();

        const paginationContent = screen.getByTestId("pagination-content");

        expect(paginationContent).toBeVisible();

        expect(paginationContent).toHaveTextContent("Show");

        const select = paginationContent.querySelector("select") as HTMLSelectElement;

        expect(select).toHaveLength(4);

        expect(select.options.selectedIndex).toBe(2);

        expect(paginationContent).toHaveTextContent("entries");
    });

    it("should render pagination as expected", () => {
        const store = getStore({
            packets: [mockPacketResponse],
            pageablePackets: {totalPages: 2} as PageablePackets
        });

        renderElement(store);

        expect(screen.getByText("1").parentElement).toHaveClass("active");
        expect(screen.queryByText("Previous")).toBeInTheDocument();
        expect(screen.getByText("Previous").parentElement).toHaveClass("disabled");
        expect(screen.queryByText("Next")).toBeInTheDocument();
        expect(screen.getByText("Next").parentElement).not.toHaveClass("disabled");
    });

    it("can trigger next pagination as expected", () => {
        const store = getStore({
            packets: [mockPacketResponse],
            pageablePackets: {totalPages: 52} as PageablePackets
        });

        renderElement(store);

        expect(screen.getByText("1").parentElement).toHaveClass("active");
        expect(screen.queryByText("Previous")).toBeInTheDocument();
        expect(screen.getByText("Previous").parentElement).toHaveClass("disabled");
        expect(screen.queryByText("1")).toBeInTheDocument();
        expect(screen.queryByText("2")).toBeInTheDocument();
        expect(screen.queryByText("3")).toBeInTheDocument();
        expect(screen.queryByText("4")).toBeInTheDocument();
        expect(screen.queryByText("5")).toBeInTheDocument();
        expect(screen.queryByText("...")).toBeInTheDocument();
        expect(screen.queryByText("50")).toBeInTheDocument();
        expect(screen.queryByText("51")).toBeInTheDocument();
        expect(screen.queryByText("Next")).toBeInTheDocument();
        expect(screen.getByText("Next").parentElement).not.toHaveClass("disabled");
    });

    it("changes page when clicking pagination", () => {

        const store = getStore({
            packets: [mockPacketResponse],
            pageablePackets: {totalPages: 2} as PageablePackets
        });

        const mockDispatch = jest.spyOn(store, "dispatch");

        renderElement(store);

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(screen.getByText("1").parentElement).toHaveClass("active");

        fireEvent.click(screen.getByText("2"));

        expect(mockDispatch).toHaveBeenCalledTimes(2);

        expect(screen.getByText("2").parentElement).toHaveClass("active");

        expect(screen.getByText("Previous").parentElement).not.toHaveClass("disabled");
        expect(screen.getByText("Next").parentElement).toHaveClass("disabled");
    });
});

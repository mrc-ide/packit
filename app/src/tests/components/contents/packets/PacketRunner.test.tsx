import React from "react";
import {render, screen} from "@testing-library/react";
import {PacketRunner} from "../../../../app/components/contents";
import {Packet, PacketsState} from "../../../../types";
import {mockPacketResponse, mockPacketsState} from "../../../mocks";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import {Store} from "@reduxjs/toolkit";
import {MemoryRouter} from "react-router-dom";

describe("packet runner component", () => {

    const getStore = (props: Partial<PacketsState> = {
        pageablePackets: {content: [mockPacketResponse] as Packet[]} as any
    }) => {
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
                <MemoryRouter>
                    <PacketRunner/>
                </MemoryRouter>
            </Provider>);
    };

    it("renders skeleton text", async () => {
        renderElement();

        const content = await screen.findByText("Packet runner page");

        expect(content).toBeInTheDocument();
    });
});

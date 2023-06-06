import React from "react";
import {render, screen} from "@testing-library/react";
import {PacketRunner} from "../../../../app/components/contents";
import {PacketsState} from "../../../../types";
import {mockPacketResponse, mockPacketsState} from "../../../mocks";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";

describe("packet runner component", () => {

    const getStore = (props: Partial<PacketsState> = {packets: [mockPacketResponse]} ) => {
        const middlewares = [thunk];
        const mockStore = configureStore(middlewares);
        const initialRootStates = {
            packets: mockPacketsState(props)
        };

        return mockStore(initialRootStates);
    };

    it("renders skeleton text", async () => {

        const store = getStore();

        render(<Provider store={store}> <PacketRunner/></Provider>);

        const content = await screen.findByText("Packet runner page");

        expect(content).toBeInTheDocument();
    });
});

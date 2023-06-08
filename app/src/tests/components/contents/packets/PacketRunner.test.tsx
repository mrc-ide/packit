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

    it("renders first packet when packet is not selected", async () => {
        const store = getStore();
        render(<Provider store={store}> <PacketRunner/></Provider>);

        expect(screen.getByText(mockPacketResponse.displayName)).toBeInTheDocument();
        expect(screen.getByText(mockPacketResponse.id)).toBeInTheDocument();

        expect(screen.getByText("Name:")).toBeInTheDocument();
        expect(screen.getByText(mockPacketResponse.name)).toBeInTheDocument();

        expect(screen.getByText("Parameters")).toBeInTheDocument();
        Object.entries(mockPacketResponse.parameters).map(([key, value ]) => {
            expect(screen.getByText(`${key}:`)).toBeInTheDocument();
            expect(screen.getByText(String(value))).toBeInTheDocument();
        });
    });

    it("renders selected packet", () => {
        const packet = {
            id: "123",
            name: "Interim update",
            displayName: "unity",
            parameters: {
                "subset": "superset"
            },
            published: false
        };
        const store = getStore({packet, packets: [mockPacketResponse]});

        render(<Provider store={store}> <PacketRunner/></Provider>);

        expect(screen.getByText(packet.displayName)).toBeInTheDocument();
        expect(screen.getByText(packet.id)).toBeInTheDocument();

        expect(screen.getByText("Name:")).toBeInTheDocument();
        expect(screen.getByText(packet.name)).toBeInTheDocument();

        expect(screen.getByText("Parameters")).toBeInTheDocument();
        Object.entries(packet.parameters).map(([key, value ]) => {
            expect(screen.getByText(`${key}:`)).toBeInTheDocument();
            expect(screen.getByText(String(value))).toBeInTheDocument();
        });
    });
});

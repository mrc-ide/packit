import React from "react";
import {render, screen} from "@testing-library/react";
import {PacketMetadata, PacketsState} from "../../../../types";
import {mockPacketsState} from "../../../mocks";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import {Store} from "@reduxjs/toolkit";
import {MemoryRouter} from "react-router-dom";
import PacketDetails from "../../../../app/components/contents/packets/PacketDetails";

describe("packet details component", () => {

    const getStore = (props: Partial<PacketsState> = {}) => {
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
                    <PacketDetails/>
                </MemoryRouter>
            </Provider>);
    };

    it("renders loading state when packet is empty", () => {
        const store = getStore({packet: {} as PacketMetadata});

        renderElement(store);

        const loadingText = screen.getByText("Loading...");

        expect(loadingText).toBeInTheDocument();
    });

    it("can render error message", () => {
        const packetError = {error: {detail: "Packet does not exist", error: "Error"}};

        const store = getStore({packetError, packet: {} as PacketMetadata});

        renderElement(store);

        const loadingText = screen.getByText("Packet does not exist");

        expect(loadingText).toBeInTheDocument();
    });

    it("renders packet details when packet is not empty", () => {
        const packet: PacketMetadata = {
            id: "123",
            name: "Interim update",
            parameters: {
                "subset": "superset"
            },
            published: false,
            files: [],
            custom: {
                orderly: {
                    artefacts: [],
                    description: {
                        display: "Corn pack",
                        custom: {}
                    }
                },

            }
        };
        const store = getStore({packet});

        renderElement(store);

        expect(screen.getByText(packet.custom!.orderly.description!.display)).toBeInTheDocument();
        expect(screen.getByText(packet.id)).toBeInTheDocument();

        expect(screen.getByText("Name:")).toBeInTheDocument();
        expect(screen.getByText(packet.name)).toBeInTheDocument();

        expect(screen.getByText("Parameters")).toBeInTheDocument();

        packet.parameters && Object.entries(packet.parameters).map(([key, value]) => {
            expect(screen.getByText(`${key}:`)).toBeInTheDocument();
            expect(screen.getByText(String(value))).toBeInTheDocument();
        });
    });
});

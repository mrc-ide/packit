import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import React from "react";
import {Download} from "../../../../app/components/contents";
import {PacketMetadata, PacketsState} from "../../../../types";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {mockPacketsState} from "../../../mocks";
import {Store} from "@reduxjs/toolkit";
import {Provider} from "react-redux";
import appConfig from "../../../../config/appConfig";

describe("download component", () => {

    const packet: PacketMetadata = {
        id: "123",
        name: "Interim update",
        parameters: {
            "subset": "superset"
        },
        published: false,
        files: [{hash: "example-hash", path: "example.html", size: 1}],
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
                    <Download/>
                </MemoryRouter>
            </Provider>);
    };

    it("render loading message when packet is being fetched", async () => {
        renderElement();

        const loadingMessage = screen.getByText("Loading...");

        expect(loadingMessage).toBeInTheDocument();
    });

    it("can render packet header", () => {

        const store = getStore({packet});

        renderElement(store);

        expect(screen.getByText(packet.custom!.orderly.description.display)).toBeInTheDocument();
        expect(screen.getByText(packet.id)).toBeInTheDocument();
    });

    it("render file and download link", async () => {

        const store = getStore({packet});

        renderElement(store);

        const downloadLink = screen.getByRole("link", { name: "example.html" });
        expect(downloadLink).toHaveAttribute("href",
            `${appConfig.apiUrl()}/packets/file/example-hash?filename=example.html`);
        expect(screen.getByText("(1 byte)")).toBeInTheDocument();
        expect(screen.getByText("Download example.html")).toBeInTheDocument();
    });

});

import {PacketsState} from "../../../../types";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {mockPacketsState} from "../../../mocks";
import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";
import React from "react";
import {PacketFile} from "../../../../app/components/contents/packets/PacketFile";
import appConfig from "../../../../config/appConfig";

describe("Packet file component", () => {
    const getStore = (props: Partial<PacketsState> = {}) => {
        const middlewares = [thunk];
        const mockStore = configureStore(middlewares);
        const initialRootStates = {
            packets: mockPacketsState(props)
        };

        return mockStore(initialRootStates);
    };

    it("renders iframe with the correct src", () => {
        const fileMetadata = {hash: "example-hash", path: "", size: 1};

        const store = getStore({packet: {files: [fileMetadata]} as any});

        const {container} = render(
            <Provider store={store}>
                <MemoryRouter>
                    <PacketFile fileMetadata={fileMetadata}/>
                </MemoryRouter>
            </Provider>
        );

        const iframe = container.querySelector("iframe");
        expect(iframe).toHaveAttribute("src", `${appConfig.apiUrl()}/packets/file/${fileMetadata.hash}`);
    });

    it("renders iframe with the correct text when file is unsupported", () => {
        const store = getStore();
        const {container} = render(
            <Provider store={store}>
                <MemoryRouter>
                    <PacketFile fileMetadata={undefined}/>
                </MemoryRouter>
            </Provider>
        );

        expect(container.querySelector("iframe")).not.toBeInTheDocument();
    });

});

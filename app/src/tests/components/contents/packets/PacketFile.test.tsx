import {PacketsState} from "../../../../types";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {mockPacketsState} from "../../../mocks";
import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";
import React from "react";
import {PacketFile} from "../../../../app/components/contents/packets/PacketFile";

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
        const hash = "example-hash";
        const fileUrl = "example-url";

        const store = getStore({packet: {files: [{hash} as any]} as any, fileUrl});

        const mockDispatch = jest.spyOn(store, "dispatch");

        const {container} = render(
            <Provider store={store}>
                <MemoryRouter>
                    <PacketFile hash={hash}/>
                </MemoryRouter>
            </Provider>
        );

        const iframe = container.querySelector("iframe");
        expect(iframe).toHaveAttribute("src", fileUrl);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

});

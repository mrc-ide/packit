import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {Metadata} from "../../../../app/components/contents";
import React from "react";
import {GitMetadata, PacketMetadata, PacketsState} from "../../../../types";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {mockPacketsState} from "../../../mocks";
import {Store} from "@reduxjs/toolkit";
import {Provider} from "react-redux";

describe("Metadata component", () => {

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

        },
        time: {start: Date.parse("2023-07-18T12:34:56Z"), end: Date.parse("2023-07-18T12:35:56Z")},
        git: {
            branch: "main",
            sha: "f98f49e4beb0fe724897792f050bf24fa3fabe85",
            url: []
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
                    <Metadata/>
                </MemoryRouter>
            </Provider>);
    };

    it("renders loading message when packet is not available", async () => {
        const store = getStore({packet: {} as PacketMetadata});

        renderElement(store);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it("renders metadata correctly when packet is available", async () => {
        const store = getStore({packet});

        renderElement(store);

        expect(screen.getByText('Started:')).toBeInTheDocument();
        expect(screen.getByText('Elapsed:')).toBeInTheDocument();
        expect(screen.getByText('Git Branch:')).toBeInTheDocument();
        expect(screen.getByText('Git Commit:')).toBeInTheDocument();

        expect(screen.getByText("Fri, 12 Dec 55513 06:13:20 GMT")).toBeInTheDocument();
        expect(screen.getByText("16 hours 40 minutes")).toBeInTheDocument();
        expect(screen.getByText("main")).toBeInTheDocument();
        expect(screen.getByText("f98f49e4beb0fe724897792f050bf24fa3fabe85")).toBeInTheDocument();
    });

    it("does not render elapsed time when datetime has no difference", async () => {
        const store = getStore({
            packet:
                {
                    ...packet,
                    time: {
                        start: Date.parse("2023-07-18T12:34:56Z"),
                        end: Date.parse("2023-07-18T12:34:56Z")
                    },
                    git: {branch: "main"} as GitMetadata,
                }
        })
        renderElement(store);

        expect(screen.queryByTestId("elapsed")).toBeNull();
        expect(screen.queryByTestId("git-sha")).toBeNull();
        expect(screen.queryByTestId("git-branch")).toBeInTheDocument();
    });

    it("does not render metadata label when value is empty", async () => {
        const store = getStore({
            packet:
                {
                    ...packet,
                    time: {
                        start: Date.parse("2023-07-18T12:34:56Z"),
                        end: Date.parse("2023-07-18T12:34:59Z")
                    },
                    git: {} as GitMetadata,

                }
        })
        renderElement(store);

        expect(screen.queryByTestId("elapsed")).toBeInTheDocument();
        expect(screen.queryByTestId("git-branch")).toBeNull();
        expect(screen.queryByTestId("git-branch")).toBeNull();
    });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { Store } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Download } from "../../../../app/components/contents";
import appConfig from "../../../../config/appConfig";
import { PacketMetadata, PacketsState, TimeMetadata } from "../../../../types";
import {mockLoginState, mockPacketsState} from "../../../mocks";

describe("download component", () => {
  const packet: PacketMetadata = {
    id: "123",
    name: "Interim update",
    parameters: {
      subset: "superset"
    },
    published: false,
    files: [{ hash: "example-hash", path: "example.html", size: 1 }],
    custom: {
      orderly: {
        artefacts: [],
        description: {
          display: "Corn pack",
          custom: {}
        }
      }
    },
    time: {} as TimeMetadata
  };

  const getStore = (props: Partial<PacketsState> = {}) => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const initialRootStates = {
      packets: mockPacketsState(props),
      login: mockLoginState({ isAuthenticated: true })
    };

    return mockStore(initialRootStates);
  };

  const renderElement = (store: Store = getStore()) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <Download />
        </MemoryRouter>
      </Provider>
    );
  };

  it("render loading message when packet is being fetched", async () => {
    renderElement();

    const loadingMessage = screen.getByText("Loading...");

    expect(loadingMessage).toBeInTheDocument();
  });

  it("can render packet header", () => {
    const store = getStore({ packet });

    renderElement(store);

    expect(screen.getByText(packet.custom.orderly.description.display)).toBeInTheDocument();

    expect(screen.getByText(packet.id)).toBeInTheDocument();
  });

  it("render file and download button", async () => {
    const store = getStore({ packet });

    renderElement(store);

    expect(screen.getByRole("button")).toHaveTextContent("example.html");
    expect(screen.getByText("(1 bytes)")).toBeInTheDocument();
    expect(screen.getByText("Download example.html")).toBeInTheDocument();
  });
});

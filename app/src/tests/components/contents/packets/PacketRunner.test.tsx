import { Store } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { PacketRunner } from "../../../../app/components/contents";
import { Packet, PacketsState } from "../../../../types";
import { mockPacketResponse, mockPacketsState } from "../../../mocks";

describe("packet runner component", () => {
  const getStore = (
    props: Partial<PacketsState> = {
      pageablePackets: { content: [mockPacketResponse] as Packet[] } as any
    }
  ) => {
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
          <PacketRunner />
        </MemoryRouter>
      </Provider>
    );
  };

  it("renders skeleton text", async () => {
    renderElement();

    const content = await screen.findByText("Packet runner page");

    expect(content).toBeInTheDocument();
  });
});

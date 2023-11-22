import { Packet, PacketsState, PageablePackets, SideBarItems } from "../../../types";
import { mockPacketResponse, mockPacketsState } from "../../mocks";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { Store } from "@reduxjs/toolkit";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Sidebar } from "../../../app/components/main/Sidebar";

// Mock react-router-dom module
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: () => ({ packetId: "packetId123" })
}));

describe("PacketMenu component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getStore = (
    props: Partial<PacketsState> = {
      pageablePackets: {
        content: [mockPacketResponse] as Packet[]
      } as PageablePackets
    }
  ) => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const initialRootStates = {
      packets: mockPacketsState(props)
    };

    return mockStore(initialRootStates);
  };

  it("renders packet menu items", () => {
    const store = getStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </Provider>
    );

    const app = screen.getByTestId("packet-menu");
    const items = app.querySelectorAll("li a");
    expect(items.length).toBe(4);

    expect(items[0]).toHaveTextContent("Packet");

    expect(items[0].getAttribute("href")).toBe("/packets/packetId123/packet");

    expect(items[1]).toHaveTextContent("Metadata");

    expect(items[2]).toHaveTextContent("Downloads");

    expect(items[3]).toHaveTextContent("Changelogs");
  });

  it("can navigate to packet page", async () => {
    await expectSidebarItemIsSelected(0, getStore());
  });

  it("can navigate to metadata page", async () => {
    await expectSidebarItemIsSelected(1, getStore());
  });

  it("can navigate to downloads page", async () => {
    await expectSidebarItemIsSelected(2, getStore());
  });

  it("can navigate to changelogs page", async () => {
    await expectSidebarItemIsSelected(3, getStore());
  });
});

const expectSidebarItemIsSelected = async (itemIndex: SideBarItems, store: Store) => {
  render(
    <Provider store={store}>
      {" "}
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    </Provider>
  );

  const packetMenu = screen.getByTestId("packet-menu");

  const list = packetMenu.querySelectorAll("li a");

  expect(list.length).toBe(4);

  if (itemIndex !== 0) {
    expect(list[itemIndex].className).toBe("");
  }

  await waitFor(() => {
    userEvent.click(list[itemIndex]);
  });

  expect(list[itemIndex].className).toBe("active");
};

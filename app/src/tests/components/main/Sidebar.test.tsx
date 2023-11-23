import { Store } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Sidebar } from "../../../app/components/main";
import { Packet, PacketsState, PageablePackets, SideBarItems } from "../../../types";
import { mockPacketResponse, mockPacketsState } from "../../mocks";

describe("sidebar component", () => {
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

  it("renders sidebar items", () => {
    const store = getStore();

    render(
      <Provider store={store}>
        {" "}
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </Provider>
    );

    const app = screen.getByTestId("sidebar");
    const items = app.querySelectorAll("li a");
    expect(items.length).toBe(4);

    expect(items[0]).toHaveTextContent("Packet explorer");
    expect(items[0].className).toBe("active");

    expect(items[1]).toHaveTextContent("Packet runner");
    expect(items[1].className).toBe("");

    expect(items[2]).toHaveTextContent("Workflow runner");
    expect(items[2].className).toBe("");

    expect(items[3]).toHaveTextContent("Project documentation");
    expect(items[3].className).toBe("");

    expect(app).toHaveTextContent("Packet explorer");
  });

  it("can navigate to packet runner page from sidebar", async () => {
    await expectSidebarItemIsSelected(SideBarItems.packetRunner, getStore());
  });

  it("can navigate to packet explorer page from sidebar", async () => {
    await expectSidebarItemIsSelected(SideBarItems.explorer, getStore());
  });

  it("can navigate to workflow page from sidebar", async () => {
    await expectSidebarItemIsSelected(SideBarItems.workflowRunner, getStore());
  });

  it("can navigate to project doc page from sidebar", async () => {
    await expectSidebarItemIsSelected(SideBarItems.projectDoc, getStore());
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

  const sidebar = screen.getByTestId("sidebar");

  const list = sidebar.querySelectorAll("li a");

  expect(list.length).toBe(4);

  if (itemIndex !== 0) {
    expect(list[itemIndex].className).toBe("");
  }

  await waitFor(() => {
    userEvent.click(list[itemIndex]);
  });

  expect(list[itemIndex].className).toBe("active");
};

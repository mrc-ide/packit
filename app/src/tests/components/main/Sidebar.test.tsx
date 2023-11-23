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

  // TODO: come back to test
  it("should test", () => {
    expect(true).toBe(true);
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

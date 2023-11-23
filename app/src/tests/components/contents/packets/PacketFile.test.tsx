import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { PacketMetadata, PacketsState } from "../../../../types";
import { mockPacketsState } from "../../../mocks";

import { PacketFile } from "../../../../app/components/contents/packets";
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
    const fileMetadata = { hash: "example-hash", path: "example.html", size: 1 };

    const store = getStore({ packet: { files: [fileMetadata] } as PacketMetadata });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <PacketFile path={"example.html"} />
        </MemoryRouter>
      </Provider>
    );

    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", `${appConfig.apiUrl()}/example.html`);
  });

  it("does not render iframe when file is empty", () => {
    const store = getStore();
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <PacketFile path={null} />
        </MemoryRouter>
      </Provider>
    );

    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });
});

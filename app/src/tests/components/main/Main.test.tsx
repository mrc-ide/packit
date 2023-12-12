import { Store } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Main } from "../../../app/components/main";
import { PacketsState } from "../../../types";
import { mockLoginState, mockPacketsState } from "../../mocks";

// TODO: unit test this
describe("main component", () => {
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
          <Main />
        </MemoryRouter>
      </Provider>
    );
  };

  it("renders active content", async () => {
    renderElement();
    const content = screen.getByTestId("content");

    await waitFor(() => {
      expect(content).toBeInTheDocument();
    });
  });

  it("renders packet root page", async () => {
    renderElement();

    await waitFor(() => {
      expect(screen.queryByTestId("packet-runner")).toBeNull();
    });
    expect(screen.queryByTestId("workflow-runner")).toBeNull();
    expect(screen.queryByTestId("project-documentation")).toBeNull();
  });
});

import { Store } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import ParameterList from "../../../../app/components/contents/packets/ParameterList";
import { PacketsState } from "../../../../types";
import { mockPacketsState } from "../../../mocks";

describe("parameterList component", () => {
  const getStore = (props: Partial<PacketsState> = {}) => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const initialRootStates = {
      packets: mockPacketsState(props)
    };

    return mockStore(initialRootStates);
  };

  const parameters = {
    subset: "superset"
  };

  const renderElement = (store: Store = getStore()) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ParameterList parameters={parameters} />
        </MemoryRouter>
      </Provider>
    );
  };

  it("renders parameter list as expected", () => {
    renderElement();
    expect(screen.getByText("Parameters")).toBeInTheDocument();
    Object.entries(parameters).map(([key, value]) => {
      expect(screen.getByText(`${key}:`)).toBeInTheDocument();
      expect(screen.getByText(String(value))).toBeInTheDocument();
    });
  });
});

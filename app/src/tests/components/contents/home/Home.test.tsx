import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";
import { Home } from "../../../../app/components/contents/home";
import * as fetch from "../../../../lib/fetch";
import appConfig from "../../../../config/appConfig";

describe("Home component", () => {
  const fetcherSpy = jest.spyOn(fetch, "fetcher");
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </SWRConfig>
    );
  it("renders reset button when filter is being filled and & calls api 2 times", async () => {
    renderComponent();

    expect(fetcherSpy).toHaveBeenCalledWith({
      url: `${appConfig.apiUrl()}/packetGroupSummaries?pageNumber=0&pageSize=50&filter=`
    });

    const filterInput = await screen.findByPlaceholderText(/filter packet groups/i);
    userEvent.type(filterInput, "test");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeVisible();
    });

    expect(fetcherSpy).toHaveBeenCalledWith({
      url: `${appConfig.apiUrl()}/packetGroupSummaries?pageNumber=0&pageSize=50&filter=test`
    });
  });
});

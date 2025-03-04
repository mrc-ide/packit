import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";
import appConfig from "../../../../config/appConfig";
import { rest } from "msw";
import { mockPacket } from "../../../mocks";
import { Pins } from "../../../../app/components/contents/home/Pins";
import { server } from "../../../../msw/server";

describe("Pins component", () => {
  const packetWithNoDisplayName = {
    ...mockPacket,
    id: "12345",
    name: "variation",
    custom: {
      ...mockPacket.custom,
      orderly: {
        ...mockPacket.custom?.orderly,
        description: {
          ...mockPacket.custom?.orderly.description,
          display: null
        }
      }
    }
  };
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter>
          <Pins />
        </MemoryRouter>
      </SWRConfig>
    );

  it("renders all pins", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/pins/packets`, (req, res, ctx) => {
        return res(ctx.json([mockPacket, packetWithNoDisplayName]));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("A packet with parameters and a report")).toBeVisible();
      expect(screen.getByText("variation")).toBeVisible();
    });
  });

  it("when there is an error fetching pins, it shows the error message", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/pins/packets`, (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Error fetching pinned reports")).toBeVisible();
    });
  });

  it("when there are no pins, it does not render", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/pins/packets`, (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Pinned reports")).not.toBeInTheDocument();
    });
  });
});

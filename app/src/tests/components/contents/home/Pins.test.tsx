import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";
import appConfig from "@config/appConfig";
import { rest } from "msw";
import { Pins } from "@components/contents/home/Pins";
import { server } from "@/msw/server";
import { mockPacket, mockPacket2 } from "@/tests/mocks";

const packetWithSameNameAsMockPacket = {
  ...mockPacket,
  id: mockPacket.id.replace("12345", "54321")
};

describe("Pins component", () => {
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter>
          <Pins />
        </MemoryRouter>
      </SWRConfig>
    );

  it("renders all pinned packets (two in this case)", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/pins/packets`, (req, res, ctx) => {
        return res(ctx.json([mockPacket, mockPacket2]));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("A packet with parameters and a report")).toBeVisible();
      expect(screen.getByText("aDifferentPacket")).toBeVisible();
      expect(screen.queryByText(mockPacket.id)).not.toBeInTheDocument();
    });
  });

  it("renders packet ids if any pins are from the same packet group, entailing the same (display) name", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/pins/packets`, (req, res, ctx) => {
        return res(ctx.json([mockPacket, packetWithSameNameAsMockPacket]));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("A packet with parameters and a report")).toBeVisible();
      expect(screen.getByText("aDifferentPacket")).toBeVisible();
      expect(screen.getByText(mockPacket.id)).toBeVisible();
      expect(screen.getByText(packetWithSameNameAsMockPacket.id)).toBeVisible();
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
      expect(screen.getByText("Error fetching pinned packets")).toBeVisible();
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
      expect(screen.queryByText("Pinned packets")).not.toBeInTheDocument();
    });
  });
});

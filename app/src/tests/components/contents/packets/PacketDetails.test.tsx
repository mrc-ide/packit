import { render, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { PacketDetails } from "../../../../app/components/contents/packets";
import { server } from "../../../../msw/server";
import { PacketMetadata } from "../../../../types";
import { mockPackets, mockPacket } from "../../../mocks";
import { packetIndexUri } from "../../../../msw/handlers/packetHandlers";
import { basicRunnerUri } from "../../../../msw/handlers/runnerHandlers";
import { PacketLayout } from "../../../../app/components/main";

jest.mock("../../../../lib/download", () => ({
  getFileObjectUrl: async () => "fakeObjectUrl"
}));

describe("packet details component", () => {
  const renderComponent = (packet: PacketMetadata = mockPacket) => {
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        <MemoryRouter initialEntries={[`/${packet.name}/${packet.id}`]}>
          <Routes>
            <Route element={<PacketLayout />} path="/:packetName/:packetId">
              <Route path="/:packetName/:packetId" element={<PacketDetails />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("renders packet header and the long description", async () => {
    renderComponent();

    expect(await screen.findByText(mockPacket.id)).toBeVisible();
    expect(await screen.findByText(mockPacket.name)).toBeVisible();
    expect(await screen.findByText(mockPacket.custom?.orderly.description.display as string)).toBeVisible();
    expect(await screen.findByText(mockPacket.custom?.orderly.description.long as string)).toBeVisible();
  });

  it("renders packet header with name and id when there is no distinct display name", async () => {
    const mockPacketWithNoCustomProps: PacketMetadata = {
      ...mockPacket,
      custom: null
    };
    renderComponent(mockPacketWithNoCustomProps);

    expect(await screen.findByText(mockPacket.id)).toBeVisible();
    expect(await screen.findByText(mockPacket.name)).toBeVisible();
  });

  it("renders parameters correctly", async () => {
    renderComponent();

    await waitFor(() => {
      Object.keys(mockPacket.parameters as object).forEach((key) => {
        expect(screen.getByText(`${key}:`)).toBeVisible();
      });
    });
  });

  it("renders html file with link", async () => {
    renderComponent();
    await waitFor(() => {
      screen.findByRole("link", { name: /fullscreen/i });
    });
  });

  it("should not render parameters or files when none", async () => {
    server.use(
      rest.get(`${packetIndexUri}/${mockPacket.id}`, (req, res, ctx) => {
        return res(ctx.json({ ...mockPacket, parameters: {}, files: [] }));
      })
    );
    renderComponent();

    await screen.findByText(mockPacket.id);

    expect(screen.queryByText((mockPacket as any).parameters["a"])).not.toBeInTheDocument();
    expect(screen.queryByText(/fullscreen/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/none/i)).toHaveLength(2);
  });

  it("should render dependencies when present", async () => {
    server.use(
      rest.post(`${packetIndexUri}`, async (req, res, ctx) => {
        const body = await req.json();
        if (body === mockPacket.depends) {
          return res(ctx.json(mockPackets));
        }
      })
    );

    renderComponent();

    await waitFor(async () => {
      mockPackets.forEach(async (packet) => {
        expect(await screen.findByText(packet.id)).toBeVisible();
      });
    });
  });

  it("should render navigate button run logs when runTaskId is present", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /view run logs/i })).toBeVisible();
    });
  });

  it("should not render navigate button run logs when runTaskId is not present", async () => {
    server.use(
      rest.get(`${basicRunnerUri}/by-packet-id/:packetId`, (req, res, ctx) => {
        return res(ctx.status(404));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /view run logs/i })).not.toBeInTheDocument();
    });
  });
});

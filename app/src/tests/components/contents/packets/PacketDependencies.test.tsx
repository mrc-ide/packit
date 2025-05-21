import { render, screen } from "@testing-library/react";
import { Accordion } from "../../../../app/components/Base/Accordion";
import { PacketDependencies } from "../../../../app/components/contents/packets/PacketDependencies";
import { PacketMetadata, Packet } from "../../../../types";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { mockDependencies, mockPacket } from "../../../mocks";
import { PacketOutlet } from "../../../../app/components/main/PacketOutlet";
import { rest } from "msw";
import { packetIndexUri } from "../../../../msw/handlers/packetHandlers";
import { server } from "../../../../msw/server";

const renderComponent = (packet: PacketMetadata = mockPacket) =>
  render(
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <MemoryRouter initialEntries={[`/${packet.name}/${packet.id}`]}>
        <Routes>
          <Route element={<PacketOutlet packetId={packet.id} />} path="/:packetName/:packetId">
            <Route
              path="/:packetName/:packetId"
              element={
                <Accordion type="single" defaultValue="dependencies">
                  <PacketDependencies />
                </Accordion>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );

describe("PacketDependencies Component", () => {
  it("should render helpful message if no dependencies", async () => {
    server.use(
      rest.get(`${packetIndexUri}/${mockPacket.id}/dependencies`, (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );
    renderComponent();

    expect(await screen.findByText(/Dependencies/)).toBeVisible();
    expect(await screen.findByText(/This packet has no dependencies on other packets/)).toBeVisible();
  });

  it("should render list of packet names with link to packets", async () => {
    renderComponent();

    mockDependencies.forEach(async (dependency: Packet) => {
      expect(await screen.findByText(dependency.id)).toBeVisible();
      const packetLink = await screen.findByRole("link", { name: dependency.id });
      expect(packetLink).toHaveAttribute("href", `/${dependency.name}/${dependency.id}`);
    });
  });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { Downloads } from "../../../../app/components/contents";
import { PacketLayout } from "../../../../app/components/main";
import { mockPacket } from "../../../mocks";
import { PacketMetadata } from "../../../../types";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import appConfig from "../../../../config/appConfig";

describe("download component", () => {
  const renderComponent = (packet: PacketMetadata = mockPacket) => {
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${packet.name}/${packet.id}/downloads`]}>
          <Routes>
            <Route element={<PacketLayout />} path="/:packetName/:packetId">
              <Route path="/:packetName/:packetId/downloads" element={<Downloads />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("can render packet header", async () => {
    renderComponent();

    expect(await screen.findByText(mockPacket.id)).toBeVisible();
    expect(await screen.findByText(mockPacket.name)).toBeVisible();
    expect(await screen.findByText(mockPacket.custom?.orderly.description.display as string)).toBeVisible();
  });

  it("renders the 'artefacts' and 'other files' sections for orderly packets", async () => {
    renderComponent();

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(await screen.findByText("Other files")).toBeInTheDocument();
  });

  it("renders files when the packet is not from orderly", async () => {
    const packetNotFromOrderly = { ...mockPacket, id: "packetNotFromOrderly", custom: null };
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/metadata/${packetNotFromOrderly.id}`, (req, res, ctx) => {
        return res(ctx.json(packetNotFromOrderly));
      })
    );
    renderComponent(packetNotFromOrderly);

    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByText("Files")).not.toBeInTheDocument();
  });
});

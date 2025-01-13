import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { SWRConfig } from "swr";
import { Downloads } from "../../../../app/components/contents";
import { PacketLayout } from "../../../../app/components/main";
import { mockPacket } from "../../../mocks";
import { Custom, PacketMetadata } from "../../../../types";
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

  it("renders the 'artefacts' and 'other files' accordion sections with only the first open", async () => {
    renderComponent();

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(await screen.findByText("Other files")).toBeInTheDocument();
    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
    expect(screen.queryByText("a_renamed_common_resource.csv")).toBeNull();

    await userEvent.click(screen.getByText("Other files"));
    expect(await screen.findByText("a_renamed_common_resource.csv")).toBeVisible();
    expect(screen.queryByText("orderly.R")).toBeNull(); // Excludes inputs with role 'orderly'.
  });

  it("renders no accordion when there are no 'other files'", async () => {
    const packetWithArtefactsOnly = {
      ...mockPacket,
      id: "packetWithArtefactsOnly",
      custom: {
        orderly: {
          ...mockPacket?.custom?.orderly,
          role: []
        }
      } as Custom
    };
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/metadata/${packetWithArtefactsOnly.id}`, (req, res, ctx) => {
        return res(ctx.json(packetWithArtefactsOnly));
      })
    );
    renderComponent(packetWithArtefactsOnly);

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(screen.queryByText("Other files")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renders no accordion when there are no 'other files'", async () => {
    const packetWithNoArtefacts = {
      ...mockPacket,
      id: "packetWithNoArtefacts",
      custom: {
        orderly: {
          ...mockPacket?.custom?.orderly,
          artefacts: []
        }
      } as Custom
    };
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/metadata/${packetWithNoArtefacts.id}`, (req, res, ctx) => {
        return res(ctx.json(packetWithNoArtefacts));
      })
    );
    renderComponent(packetWithNoArtefacts);

    expect(await screen.findByText("Files")).toBeInTheDocument();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renders a message when there are no files", async () => {
    const packetWithNoFiles = {
      ...mockPacket,
      id: "packetWithNoArtefacts",
      custom: {
        orderly: {
          ...mockPacket?.custom?.orderly,
          role: [],
          artefacts: []
        }
      } as Custom
    };
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/metadata/${packetWithNoFiles.id}`, (req, res, ctx) => {
        return res(ctx.json(packetWithNoFiles));
      })
    );
    renderComponent(packetWithNoFiles);

    expect(await screen.findByText(/There are no artefacts/)).toBeInTheDocument();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByText("Files")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
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

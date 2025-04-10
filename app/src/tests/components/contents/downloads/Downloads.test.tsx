import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { Downloads } from "../../../../app/components/contents";
import { PacketOutlet } from "../../../../app/components/main/PacketOutlet";
import appConfig from "../../../../config/appConfig";
import { server } from "../../../../msw/server";
import { PacketMetadata } from "../../../../types";
import { mockPacket } from "../../../mocks";

const mockDownload = jest.fn();
jest.mock("../../../../lib/download", () => ({
  ...jest.requireActual("../../../../lib/download"),
  download: async (...args: any[]) => mockDownload(...args)
}));

describe("download component", () => {
  URL.createObjectURL = jest.fn(() => "fakeObjectUrl");

  const renderComponent = (packet: PacketMetadata = mockPacket) => {
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${packet.name}/${packet.id}/downloads`]}>
          <Routes>
            <Route element={<PacketOutlet packetId={packet.id} />}>
              <Route path="/:packetName/:packetId/downloads" element={<Downloads />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("can render packet header", async () => {
    renderComponent();

    expect(await screen.findByText(mockPacket.id)).toBeVisible();
    expect(await screen.findByText(mockPacket.name)).toBeVisible();
    expect(await screen.findByText(mockPacket.custom?.orderly.description.display as string)).toBeVisible();
  });

  it("renders the 'Download all files' button, which downloads the correct files", async () => {
    renderComponent();

    const downloadAllButton = await screen.findByText(/Download all files \(\d+\.\d+ KB\)/);
    expect(downloadAllButton).toBeVisible();
    userEvent.click(downloadAllButton);
    const url = `${appConfig.apiUrl()}/packets/${mockPacket.id}/zip?paths=${encodeURIComponent(
      mockPacket.files.map((f) => f.path).join(",")
    )}`;
    expect(mockDownload).toHaveBeenCalledWith(url, `parameters_${mockPacket.id}.zip`);
  });

  it("renders the 'artefacts' and 'other files' sections for orderly packets", async () => {
    renderComponent();

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(await screen.findByText("Other files")).toBeInTheDocument();
  });

  it("renders files when the packet is not from orderly", async () => {
    const packetNotFromOrderly = { ...mockPacket, id: "packetNotFromOrderly", custom: null };
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/${packetNotFromOrderly.id}`, (req, res, ctx) => {
        return res(ctx.json(packetNotFromOrderly));
      })
    );
    renderComponent(packetNotFromOrderly);

    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByText("Files")).not.toBeInTheDocument();
  });
});

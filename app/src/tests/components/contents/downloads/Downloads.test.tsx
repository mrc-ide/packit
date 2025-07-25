import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { Downloads } from "@components/contents";
import appConfig from "@config/appConfig";
import { server } from "@/msw/server";
import { PacketMetadata } from "@/types";
import { mockPacket } from "@/tests/mocks";
import { PacketLayout } from "@components/main";
import * as UserProvider from "@components/providers/UserProvider";

const mockDownload = vitest.fn();
vitest.mock("@lib/download", async () => ({
  ...(await vitest.importActual("@lib/download")),
  download: async (...args: any[]) => mockDownload(...args)
}));
const mockUseUser = vitest.spyOn(UserProvider, "useUser");

describe("download component", () => {
  URL.createObjectURL = vitest.fn(() => "fakeObjectUrl");

  const renderComponent = (packet: PacketMetadata = mockPacket) => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={[`/${packet.name}/${packet.id}/downloads`]}>
          <Routes>
            <Route element={<PacketLayout />}>
              <Route path="/:packetName/:packetId/downloads" element={<Downloads />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  beforeEach(() => {
    mockUseUser.mockReturnValue({
      authorities: []
    } as any);
  });
  afterAll(() => {
    vitest.clearAllMocks();
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
    expect(mockDownload).toHaveBeenCalledWith(mockPacket.files, mockPacket.id, `parameters_${mockPacket.id}.zip`, true);
  });

  it("renders the 'artefacts' and 'other files' sections for orderly packets", async () => {
    renderComponent();

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(await screen.findByText("Other files")).toBeInTheDocument();
  });

  it("renders files when the packet is not from orderly", async () => {
    const packetNotFromOrderly = { ...mockPacket, id: "20250000-987654-99ff9999", custom: null };
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

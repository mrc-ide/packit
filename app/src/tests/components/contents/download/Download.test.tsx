import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { SWRConfig } from "swr";
import { Download } from "../../../../app/components/contents";
import { PacketLayout } from "../../../../app/components/main";
import appConfig from "../../../../config/appConfig";
import { mockPacket } from "../../../mocks";

describe("download component", () => {
  const renderComponent = () => {
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${mockPacket.name}/${mockPacket.id}/downloads`]}>
          <Routes>
            <Route element={<PacketLayout />} path="/:packetName/:packetId">
              <Route path="/:packetName/:packetId/downloads" element={<Download />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("render file and download link", async () => {
    renderComponent();

    const downloadLink = await screen.findByRole("link", { name: /report.html/i });
    expect(downloadLink).toHaveAttribute(
      "href",
      `${appConfig.apiUrl()}/packets/file/${mockPacket.files[1].hash}?filename=${mockPacket.files[1].path}`
    );
    expect(screen.getByText("(137 bytes)")).toBeInTheDocument();
    expect(screen.getByText(`Download ${mockPacket.files[0].path}`)).toBeInTheDocument();
  });
});

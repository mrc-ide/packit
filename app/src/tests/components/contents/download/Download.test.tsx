import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { SWRConfig } from "swr";
import { Download } from "../../../../app/components/contents";
import { PacketLayout } from "../../../../app/components/main";
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

  it("can render packet header", async () => {
    renderComponent();

    expect(await screen.findByText(mockPacket.id)).toBeVisible();
    expect(await screen.findByText(mockPacket.name)).toBeVisible();
    expect(await screen.findByText(mockPacket.custom?.orderly.description.display as string)).toBeVisible();
  });

  it("render file and download button", async () => {
    renderComponent();

    const downloadButtons = await screen.findAllByRole("button");
    expect(downloadButtons.length).toBe(2);
    expect(downloadButtons[0]).toHaveTextContent("orderly.R");
    expect(screen.getByText("(137 bytes)")).toBeInTheDocument();
    expect(downloadButtons[1]).toHaveTextContent("report.html");
    expect(screen.getByText("(40 bytes)")).toBeInTheDocument();
  });
});

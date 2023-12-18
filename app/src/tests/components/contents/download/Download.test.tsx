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
          </Routes>n
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("render loading message when packet is being fetched", async () => {
    renderComponent();

    const loadingMessage = screen.getByText("Loading...");

    expect(loadingMessage).toBeInTheDocument();
  });

  it("can render packet header", () => {
    //const store = getStore({ packet });

    renderComponent();

    expect(screen.getByText(mockPacket.id)).toBeInTheDocument();
  });

  it("render file and download button", async () => {
    //const store = getStore({ packet });

    renderComponent();

    expect(screen.getByRole("button")).toHaveTextContent("example.html");
    expect(screen.getByText("(1 bytes)")).toBeInTheDocument();
    expect(screen.getByText("Download example.html")).toBeInTheDocument();
  });
});

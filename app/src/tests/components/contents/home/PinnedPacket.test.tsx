import { render, screen } from "@testing-library/react";
import { mockPacket } from "../../../mocks";
import { PinnedPacket } from "../../../../app/components/contents/home/PinnedPacket";
import { SWRConfig } from "swr";
import { MemoryRouter } from "react-router-dom";
import { PacketMetadata } from "../../../../types";
import userEvent from "@testing-library/user-event";

const mockDownload = vitest.fn();
vitest.mock("../../../../lib/download", async () => ({
  ...(await vitest.importActual("../../../../lib/download")),
  download: async (...args: any[]) => mockDownload(...args)
}));

describe("Pinned Packet component", () => {
  const renderComponent = (packet: PacketMetadata) =>
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter>
          <PinnedPacket packet={packet} />
        </MemoryRouter>
      </SWRConfig>
    );

  it("renders as expected", async () => {
    const packetMetadata = {
      ...mockPacket,
      displayName: "Pinned packet"
    };
    renderComponent(packetMetadata);

    expect(screen.getByRole("link", { name: "Pinned packet" })).toHaveAttribute("href", `/parameters/${mockPacket.id}`);
    expect(screen.getByRole("button", { name: /Download artefacts/ })).toBeInTheDocument();
    expect(screen.getByText(/Ran \d*\sdays ago/)).toBeInTheDocument();
  });

  it("renders the name when there is no display name", async () => {
    renderComponent(mockPacket);

    expect(screen.getByRole("link", { name: "parameters" })).toHaveAttribute("href", `/parameters/${mockPacket.id}`);
    expect(screen.getByRole("button", { name: /Download artefacts/ })).toBeInTheDocument();
    expect(screen.getByText(/Ran \d*\sdays ago/)).toBeInTheDocument();
  });

  it("it downloads the correct files", async () => {
    renderComponent(mockPacket);

    const downloadAllButton = await screen.findByText(/Download artefacts \(\d+\.\d+ KB\)/);
    expect(downloadAllButton).toBeVisible();
    userEvent.click(downloadAllButton);

    const filesToBeDownloaded = mockPacket.files.filter((file) =>
      [
        "report.html",
        "directory/graph.png",
        "artefact_data.csv",
        "excel_file.xlsx",
        "internal_presentation.pdf",
        "other_extensions.txt"
      ].includes(file.path)
    );
    const zipName = `${mockPacket.name}_artefacts_${mockPacket.id}.zip`;
    expect(mockDownload).toHaveBeenCalledWith(filesToBeDownloaded, mockPacket.id, zipName, true);
  });
});

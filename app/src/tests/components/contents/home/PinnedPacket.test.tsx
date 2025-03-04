import { render, screen } from "@testing-library/react";
import { mockPacket } from "../../../mocks";
import { PinnedPacket } from "../../../../app/components/contents/home/PinnedPacket";
import { SWRConfig } from "swr";
import { MemoryRouter } from "react-router-dom";
import { PacketMetadata } from "../../../../types";
import userEvent from "@testing-library/user-event";
import appConfig from "../../../../config/appConfig";

const mockDownload = jest.fn();
jest.mock("../../../../lib/download", () => ({
  ...jest.requireActual("../../../../lib/download"),
  download: async (...args: any[]) => mockDownload(...args)
}));

describe("Pins component", () => {
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
    const url = `${appConfig.apiUrl()}/packets/${mockPacket.id}/zip?paths=${encodeURIComponent(
      [
        "report.html",
        "directory/graph.png",
        "artefact_data.csv",
        "excel_file.xlsx",
        "internal_presentation.pdf",
        "other_extensions.txt"
      ].join(",")
    )}`;
    expect(mockDownload).toHaveBeenCalledWith(url, `parameters_artefacts_${mockPacket.id}.zip`);
  });
});

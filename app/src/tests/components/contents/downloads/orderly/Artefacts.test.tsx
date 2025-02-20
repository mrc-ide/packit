import { render, screen } from "@testing-library/react";
import { Artefacts } from "../../../../../app/components/contents/downloads/orderly/Artefacts";
import { mockPacket } from "../../../../mocks";
import { Artefact, PacketMetadata } from "../../../../../types";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import userEvent from "@testing-library/user-event";
import appConfig from "../../../../../config/appConfig";

const mockDownload = jest.fn();
jest.mock("../../../../../lib/download", () => ({
  ...jest.requireActual("../../../../../lib/download"),
  download: async (...args: any[]) => mockDownload(...args)
}));

const fileNamesOfMultifileArtefact = [
  "directory/graph.png",
  "artefact_data.csv",
  "excel_file.xlsx",
  "internal_presentation.pdf",
  "other_extensions.txt"
];

const renderComponent = (packet?: PacketMetadata) => {
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={[`/${mockPacket.name}/${mockPacket.id}/downloads`]}>
        <Routes>
          <Route element={<Outlet context={{ packet }} />}>
            <Route
              path="/:packetName/:packetId/downloads"
              element={<Artefacts artefacts={mockPacket.custom?.orderly.artefacts as Artefact[]} />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
};

describe("Artefacts component", () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it("renders each artefact's description and its files' names", async () => {
    renderComponent(mockPacket);

    expect(await screen.findByText("An HTMl report")).toBeVisible();
    expect(await screen.findByText("report.html")).toBeVisible();
    expect(await screen.findByText("An artefact containing multiple files")).toBeVisible();
    expect(await screen.findByText("graph.png")).toBeVisible();
    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
    expect(await screen.findByText("excel_file.xlsx")).toBeVisible();
    expect(await screen.findByText("internal_presentation.pdf")).toBeVisible();
    expect(await screen.findByText("other_extensions.txt")).toBeVisible();
  });

  it("renders the 'Download all artefacts' button, which downloads the correct files", async () => {
    renderComponent(mockPacket);

    const downloadAllButton = await screen.findByText(/Download all artefacts \(\d+\.\d+ KB\)/);
    expect(downloadAllButton).toBeVisible();
    userEvent.click(downloadAllButton);
    const url = `${appConfig.apiUrl()}/packets/${mockPacket.id}/zip?paths=${encodeURIComponent(
      ["report.html"].concat(fileNamesOfMultifileArtefact).join(",")
    )}`;
    expect(mockDownload).toHaveBeenCalledWith(url, `parameters_artefacts_${mockPacket.id}.zip`);
  });

  it("renders a 'Download' button per artefact, except if the artefact contains only one file", async () => {
    renderComponent(mockPacket);

    const artefactGroupDownloadButtonMatcher = /Download \(\d+\.\d+ KB\)/;
    expect(await screen.findAllByText(artefactGroupDownloadButtonMatcher)).toHaveLength(1);
    const button = await screen.findByText(artefactGroupDownloadButtonMatcher);
    userEvent.click(button);
    const url = `${appConfig.apiUrl()}/packets/${mockPacket.id}/zip?paths=${encodeURIComponent(
      fileNamesOfMultifileArtefact.join(",")
    )}`;
    expect(mockDownload).toHaveBeenCalledWith(url, `An artefact containi_${mockPacket.id}.zip`);
  });

  it("when packet is not found it returns null", async () => {
    renderComponent();

    expect(screen.queryByText("An HTMl report")).not.toBeInTheDocument();
  });
});

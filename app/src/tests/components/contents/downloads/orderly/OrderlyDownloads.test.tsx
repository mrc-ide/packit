import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockPacket } from "../../../../mocks";
import { Custom } from "../../../../../types";
import { OrderlyDownloads } from "../../../../../app/components/contents/downloads/orderly/OrderlyDownloads";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import appConfig from "../../../../../config/appConfig";

const mockDownload = jest.fn();
jest.mock("../../../../../lib/download", () => ({
  ...jest.requireActual("../../../../../lib/download"),
  download: async (...args: any[]) => mockDownload(...args)
}));

const renderComponent = (customMetadata: Custom) => {
  const packet = { ...mockPacket, custom: customMetadata };
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={[`/${packet.name}/${packet.id}/downloads`]}>
        <Routes>
          <Route element={<Outlet context={{ packet }} />}>
            <Route path="/:packetName/:packetId/downloads" element={<OrderlyDownloads />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
};

describe("orderly downloads component", () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it("renders the 'artefacts' and 'other files' accordion sections with only the first open", async () => {
    renderComponent(mockPacket.custom as Custom);

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(await screen.findByText("Other files")).toBeInTheDocument();
    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
    expect(screen.queryByText("a_renamed_common_resource.csv")).toBeNull();

    userEvent.click(screen.getByText("Other files"));
    expect(await screen.findByText("a_renamed_common_resource.csv")).toBeVisible();
    expect(await screen.findByText("orderly.R")).toBeVisible();
  });

  it("renders no accordion when there are no 'other files'", async () => {
    const customMetadata = { orderly: { ...mockPacket?.custom?.orderly, role: [] } } as Custom;
    renderComponent(customMetadata);

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(screen.queryByText("Other files")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renders no accordion when there are no artefacts", async () => {
    const customMetadata = { orderly: { ...mockPacket?.custom?.orderly, artefacts: [] } } as Custom;
    renderComponent(customMetadata);

    expect(await screen.findByText("Files")).toBeInTheDocument();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renders a message when there are no files", async () => {
    const customMetadata = { orderly: { ...mockPacket?.custom?.orderly, role: [], artefacts: [] } } as Custom;
    renderComponent(customMetadata);

    expect(await screen.findByText(/There are no artefacts/)).toBeInTheDocument();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByText("Files")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renders the 'Download' button which downloads the 'other' files as a group", async () => {
    renderComponent(mockPacket.custom as Custom);

    const otherFiles = ["data.csv", "orderly.R", "a_renamed_common_resource.csv"];
    const otherFilesDownloadButtonMatcher = /Download \(\d+.\d+ bytes\)/;

    userEvent.click(await screen.findByText("Other files"));

    await waitFor(async () => {
      expect(await screen.findByText(otherFilesDownloadButtonMatcher)).toBeVisible();
    });

    userEvent.click(await screen.findByText(otherFilesDownloadButtonMatcher));
    const url = `${appConfig.apiUrl()}/packets/${mockPacket.id}/zip?paths=${encodeURIComponent(otherFiles.join(","))}`;
    expect(mockDownload).toHaveBeenCalledWith(url, `parameters_other_resources_${mockPacket.id}.zip`);
  });
});

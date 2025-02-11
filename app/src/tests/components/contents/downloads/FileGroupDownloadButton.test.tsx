import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DownloadButton } from "../../../../app/components/contents/downloads/DownloadButton";
import appConfig from "../../../../config/appConfig";
import { FileGroupDownloadButton } from "../../../../app/components/contents/downloads/FileGroupDownloadButton";
import { FileMetadata, PacketMetadata } from "../../../../types";
import { mockPacket } from "../../../mocks";
import { SWRConfig } from "swr";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PacketLayout } from "../../../../app/components/main";
import { Downloads } from "../../../../app/components/contents";

let errorOnDownload = false;
const mockDownload = jest.fn();
jest.mock("../../../../lib/download", () => ({
  ...jest.requireActual("../../../../lib/download"),
  download: async (...args: any[]) => mockDownload(...args)
}));

describe("FileGroupDownloadButton", () => {
  const files = [
    {
      path: "test.txt",
      size: 1024,
      hash: "fakeHash"
    },
    {
      path: "test2.pdf",
      size: 2048,
      hash: "fakeHash2"
    }
  ] as FileMetadata[];
  const zipName = "myCompressedFiles.zip";
  const buttonText = "Custom text";

  const renderComponent = () => {
    return render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${mockPacket.name}/${mockPacket.id}/downloads`]}>
          <Routes>
            <Route element={<PacketLayout />} path="/:packetName/:packetId">
              <Route
                path="/:packetName/:packetId/downloads"
                element={
                  <FileGroupDownloadButton files={files} zipName={zipName} buttonText={buttonText} variant="ghost" />
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  beforeEach(() => {
    mockDownload.mockImplementation(() => {
      if (errorOnDownload) {
        throw Error("test download error");
      }
    });
    errorOnDownload = false;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders as expected", async () => {
    const { container } = renderComponent();
    expect(await screen.findByRole("button")).toHaveTextContent("Custom text (3 KB)");
    const icon = container.querySelector(".lucide") as HTMLImageElement;
    expect(icon.classList).toContain("lucide-folder-down");
  });

  it("downloads files", async () => {
    renderComponent();

    const button = await screen.findByRole("button");
    userEvent.click(button);
    expect(button).toBeDisabled();
    const url = `${appConfig.apiUrl()}/packets/${mockPacket.id}/zip?paths=${encodeURIComponent(
      ["test.txt", "test2.pdf"].join(",")
    )}`;
    expect(mockDownload).toHaveBeenCalledWith(url, zipName);
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("shows download error, and resets on success", async () => {
    renderComponent();
    errorOnDownload = true;

    userEvent.click(await screen.findByRole("button"));
    await waitFor(() => {
      expect(screen.queryByText("test download error")).toBeInTheDocument();
    });

    errorOnDownload = false;
    userEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.queryByText("test download error")).not.toBeInTheDocument();
    });
  });
});

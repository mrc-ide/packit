import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import appConfig from "../../../../config/appConfig";
import { ZipDownloadButton } from "../../../../app/components/contents/downloads/ZipDownloadButton";
import { FileMetadata } from "../../../../types";
import { mockPacket } from "../../../mocks";

let errorOnDownload = false;
const mockDownload = jest.fn();
jest.mock("../../../../lib/download", () => ({
  ...jest.requireActual("../../../../lib/download"),
  download: async (...args: any[]) => mockDownload(...args)
}));

describe("ZipDownloadButton", () => {
  const filesToDownload = [
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

  const renderComponent = (files = filesToDownload) => {
    return render(
      <ZipDownloadButton
        packetId={mockPacket.id}
        files={files}
        zipName={zipName}
        buttonText={buttonText}
        variant="ghost"
      />
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

  it("shows any download errors, and resets error display on re-trying the download", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeVisible();
    });

    errorOnDownload = true;
    userEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.queryByText("test download error")).toBeInTheDocument();
    });

    errorOnDownload = false;
    userEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.queryByText("test download error")).not.toBeInTheDocument();
    });
  });

  it("does not download if the files list is empty", async () => {
    renderComponent([]);
    const button = await screen.findByRole("button");
    userEvent.click(button);
    expect(mockDownload).not.toHaveBeenCalled();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DownloadButton } from "../../../../app/components/contents/downloads/DownloadButton";
import appConfig from "../../../../config/appConfig";

let errorOnDownload = false;
const mockDownload = jest.fn();
jest.mock("../../../../lib/download", () => ({
  ...jest.requireActual("../../../../lib/download"),
  download: async (...args: any[]) => mockDownload(...args)
}));

describe("DownloadButton", () => {
  const file = {
    path: "test.txt",
    size: 1024,
    hash: "fakeHash"
  };
  const packetId = "fakePacketId";

  const renderComponent = () => {
    render(<DownloadButton file={file} packetId={packetId} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDownload.mockImplementation(() => {
      if (errorOnDownload) {
        throw Error("test download error");
      }
    });
    errorOnDownload = false;
  });

  it("renders as expected", () => {
    const { container } = render(<DownloadButton file={file} packetId={packetId} />);
    expect(screen.getByRole("button")).toHaveTextContent("Download");
    const icon = container.querySelector(".lucide") as HTMLImageElement;
    expect(icon.classList).toContain("lucide-file-down");
  });

  it("downloads file", () => {
    renderComponent();

    userEvent.click(screen.getByRole("button"));
    const url = `${appConfig.apiUrl()}/packets/file/${packetId}?hash=${file.hash}&filename=${file.path}&inline=false`;
    expect(mockDownload).toHaveBeenCalledWith(url, "test.txt");
  });

  it("shows download error, and resets on success", async () => {
    renderComponent();
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
});

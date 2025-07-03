import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileDownloadButton } from "../../../../app/components/contents/downloads/FileDownloadButton";

let errorOnDownload = false;
const mockDownload = vitest.fn();
vitest.mock("../../../../lib/download", async () => ({
  ...(await vitest.importActual("../../../../lib/download")),
  download: async (...args: any[]) => mockDownload(...args)
}));

describe("FileDownloadButton", () => {
  const file = {
    path: "test.txt",
    size: 1024,
    hash: "fakeHash"
  };
  const packetId = "fakePacketId";

  const renderComponent = () => {
    return render(<FileDownloadButton file={file} packetId={packetId} />);
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
    vitest.clearAllMocks();
  });

  it("renders as expected", () => {
    const { container } = renderComponent();
    expect(screen.getByRole("button")).toHaveTextContent("Download");
    const icon = container.querySelector(".lucide") as HTMLImageElement;
    expect(icon.classList).toContain("lucide-file-down");
  });

  it("downloads file", async () => {
    renderComponent();

    const button = screen.getByRole("button");
    userEvent.click(button);
    expect(button).toBeDisabled();
    expect(mockDownload).toHaveBeenCalledWith([file], "fakePacketId", "test.txt");
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("shows any download errors, and resets on success", async () => {
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

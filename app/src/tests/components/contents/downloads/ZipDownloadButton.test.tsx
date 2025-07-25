import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ZipDownloadButton } from "@components/contents/downloads/ZipDownloadButton";
import { FileMetadata } from "@/types";
import { mockPacket } from "@/tests/mocks";
import * as UserProvider from "@components/providers/UserProvider";

let errorOnDownload = false;
const mockDownload = vitest.fn();
vitest.mock("@lib/download", async () => ({
  ...(await vitest.importActual("@lib/download")),
  download: async (...args: any[]) => mockDownload(...args)
}));
const mockUseUser = vitest.spyOn(UserProvider, "useUser");

describe("ZipDownloadButton", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      authorities: []
    } as any);
  });

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
  const testContainerClass = "testContainerClass";
  let disabled: boolean;

  const renderComponent = (files = filesToDownload) => {
    return render(
      <ZipDownloadButton
        packetId={mockPacket.id}
        files={files}
        zipName={zipName}
        buttonText={buttonText}
        containerClassName={testContainerClass}
        variant="ghost"
        disabled={disabled}
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
    disabled = false;
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it("renders as expected", async () => {
    const { container } = renderComponent();
    expect(await screen.findByRole("button")).toHaveTextContent("Custom text (3 KB)");
    const icon = container.querySelector(".lucide") as HTMLImageElement;
    expect(icon.classList).toContain("lucide-folder-down");
    expect(screen.getByTestId("zip-download-button").classList).toContain("testContainerClass");
  });

  it("can render as disabled", async () => {
    disabled = true;
    renderComponent();
    expect(await screen.findByRole("button")).toBeDisabled();
    expect(await screen.findByRole("button")).toHaveTextContent("Custom text");
  });

  it("downloads files", async () => {
    renderComponent();

    const button = await screen.findByRole("button");
    userEvent.click(button);
    expect(button).toBeDisabled();
    expect(mockDownload).toHaveBeenCalledWith(filesToDownload, mockPacket.id, zipName, true);
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  // TODO: Fix this flakey test. Ticket: mrc-6223
  it.skip("shows any download errors, and resets error display on re-trying the download", async () => {
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

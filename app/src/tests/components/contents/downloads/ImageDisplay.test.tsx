import { render, screen, waitFor } from "@testing-library/react";
import { PacketMetadata } from "../../../../types";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { ImageDisplay } from "../../../../app/components/contents/downloads/ImageDisplay";
import { SWRConfig } from "swr";

const mockGetFileObjectUrl = jest.fn();
jest.mock("../../../../lib/download", () => ({
  ...jest.requireActual("../../../../lib/download"),
  getFileObjectUrl: async (...args: any[]) => mockGetFileObjectUrl(...args)
}));
const revokeObjectURL = jest.fn();
URL.revokeObjectURL = revokeObjectURL;

describe("image display component", () => {
  const file = { path: "test.png", hash: "sha256:12345", size: 12345 };
  const packet = {
    files: [file],
    id: "20231130-082812-cd744153"
  } as PacketMetadata;

  const renderComponent = () => {
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <Route path="/" element={<ImageDisplay file={file} packet={packet} />} />
      </SWRConfig>
    );
  };

  beforeEach(() => {
    mockGetFileObjectUrl.mockImplementation(() => "fakeObjectUrl");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("gets file object url for image src", async () => {
    renderComponent();

    await waitFor(() => {
      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("src", "fakeObjectUrl");
      expect(image).toHaveAttribute("alt", "test.png");
    });

    expect(mockGetFileObjectUrl).toHaveBeenCalledWith(file, packet.id, file.path);
  });

  it("renders error component if error fetching file data", async () => {
    mockGetFileObjectUrl.mockImplementation(() => {
      throw new Error("test error");
    });
    renderComponent();

    expect(await screen.findByText(/Error loading image file/i)).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("revokes the object URL when the component is unmounted", async () => {
    const { unmount } = renderComponent();

    await screen.findByRole("img");

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("fakeObjectUrl");
  });
});

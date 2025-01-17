import { render, screen, waitFor } from "@testing-library/react";
import { PacketReport } from "../../../../app/components/contents/packets/PacketReport";
import { PacketMetadata } from "../../../../types";

const mockGetFileObjectUrl = jest.fn();
jest.mock("../../../../lib/download", () => ({
  getFileObjectUrl: async (...args: any[]) => mockGetFileObjectUrl(...args)
}));
const mockHash = "sha256:12345";
describe("PacketReport component", () => {
  const packet = {
    files: [{ path: "test.html", hash: mockHash }],
    id: "20231130-082812-cd744153"
  } as unknown as PacketMetadata;

  const renderComponent = (fileHash = mockHash) => {
    render(<PacketReport packet={packet} fileHash={fileHash} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFileObjectUrl.mockImplementation(() => "fakeObjectUrl");
  });

  it("gets file object url for report src", async () => {
    renderComponent();
    await waitFor(() => {
      const iframe = screen.getByTestId("report-iframe");
      expect(iframe).toBeVisible();
      expect(iframe.getAttribute("src")).toBe("fakeObjectUrl");
      expect(mockGetFileObjectUrl).toHaveBeenCalledWith(
        `http://localhost:8080/packets/file/${packet.id}?hash=${mockHash}?inline=true&filename=test.html`,
        ""
      );
    });
  });

  it("renders error component if error fetching report data", async () => {
    mockGetFileObjectUrl.mockImplementation(() => {
      throw new Error("test error");
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Error loading report/i)).toBeVisible();
      expect(screen.queryByTestId("report-iframe")).not.toBeInTheDocument();
    });
  });

  it("renders error component if fileHash prop does not match packet report file", async () => {
    renderComponent("sha256:wrong");
    await waitFor(() => {
      expect(screen.getByText(/Error loading report/i)).toBeVisible();
      expect(screen.queryByTestId("report-iframe")).not.toBeInTheDocument();
    });
  });
});

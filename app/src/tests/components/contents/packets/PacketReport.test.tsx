import { render, screen, waitFor } from "@testing-library/react";
import { PacketReport } from "../../../../app/components/contents/packets/PacketReport";
import { PacketMetadata } from "../../../../types";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";

const mockGetFileObjectUrl = jest.fn();
jest.mock("../../../../lib/download", () => ({
  ...jest.requireActual("../../../../lib/download"),
  getFileObjectUrl: async (...args: any[]) => mockGetFileObjectUrl(...args)
}));
const mockHash = "sha256:12345";
const revokeObjectURL = jest.fn();
URL.revokeObjectURL = revokeObjectURL;
describe("PacketReport component", () => {
  const packet = {
    files: [{ path: "test.html", hash: mockHash }],
    id: "20231130-082812-cd744153"
  } as unknown as PacketMetadata;

  const renderComponent = (fileHash = mockHash) => {
    const routes = [
      {
        path: "/",
        element: <Outlet context={{ packet }} />,
        children: [{ path: "/", element: <PacketReport packet={packet} fileHash={fileHash} /> }]
      }
    ];
    const router = createMemoryRouter(routes, { initialEntries: ["/"] });

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    mockGetFileObjectUrl.mockImplementation(() => "fakeObjectUrl");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("gets file object url for report src", async () => {
    renderComponent();

    const iframe = await screen.findByTestId("report-iframe");
    expect(iframe).toBeVisible();
    expect(iframe.getAttribute("src")).toBe("fakeObjectUrl");
    expect(mockGetFileObjectUrl).toHaveBeenCalledWith(
      `http://localhost:8080/packets/file/${packet.id}?hash=${mockHash}&filename=test.html&inline=true`,
      "test.html"
    );
  });

  it("renders error component if error fetching report data", async () => {
    mockGetFileObjectUrl.mockImplementation(() => {
      throw new Error("test error");
    });
    renderComponent();

    expect(await screen.findByText(/Error loading report/i)).toBeVisible();
    expect(screen.queryByTestId("report-iframe")).not.toBeInTheDocument();
  });

  it("renders error component if fileHash prop does not match packet report file", async () => {
    renderComponent("sha256:wrong");

    expect(await screen.findByText(/Error loading report/i)).toBeVisible();
    expect(screen.queryByTestId("report-iframe")).not.toBeInTheDocument();
  });

  it("revokes the object URL when the component is unmounted", async () => {
    const { unmount } = renderComponent();

    await screen.findByTestId("report-iframe");

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("fakeObjectUrl");
  });
});

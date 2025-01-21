import { render, screen } from "@testing-library/react";
import { PacketMetadata } from "../../../../types";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";
import { ImageDisplay } from "../../../../app/components/contents/downloads/ImageDisplay";

const mockGetFileObjectUrl = jest.fn();
jest.mock("../../../../lib/download", () => ({
  ...jest.requireActual("../../../../lib/download"),
  getFileObjectUrl: async (...args: any[]) => mockGetFileObjectUrl(...args)
}));
const mockHash = "sha256:12345";
const revokeObjectURL = jest.fn();
URL.revokeObjectURL = revokeObjectURL;
describe("image display component", () => {
  const packet = {
    files: [{ path: "test.png", hash: mockHash }],
    id: "20231130-082812-cd744153"
  } as unknown as PacketMetadata;

  const renderComponent = (fileHash = mockHash) => {
    const routes = [
      {
        path: "/",
        element: <Outlet context={{ packet }} />,
        children: [{ path: "/", element: <ImageDisplay packet={packet} fileHash={fileHash} /> }]
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

  it("gets file object url for image src", async () => {
    renderComponent();

    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("src", "fakeObjectUrl");
    expect(image).toHaveAttribute("alt", "test.png");

    expect(mockGetFileObjectUrl).toHaveBeenCalledWith(
      `http://localhost:8080/packets/file/${packet.id}?hash=${mockHash}&filename=test.png&inline=false`,
      "test.png"
    );
  });

  it("renders error component if error fetching file data", async () => {
    mockGetFileObjectUrl.mockImplementation(() => {
      throw new Error("test error");
    });
    renderComponent();

    expect(await screen.findByText(/Error loading image file/i)).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders error component if fileHash prop does not match file", async () => {
    renderComponent("sha256:wrong");

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

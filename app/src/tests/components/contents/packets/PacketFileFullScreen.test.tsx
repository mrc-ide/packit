import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { mockPacket } from "../../../mocks";
import { PacketFileFullScreen } from "../../../../app/components/contents/packets";
import { SWRConfig } from "swr";

const imageFile = mockPacket.files.filter((file) => file.path === "directory/graph.png")[0];

describe("PacketFileFullScreen", () => {
  const renderComponent = (filePath: string) => {
    // TODO: Make other test setups more similar to this one
    return render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${mockPacket.name}/${mockPacket.id}/file/${filePath}`]}>
          <Routes>
            {/*Should next line have path?*/}
            <Route element={<Outlet context={{ packet: mockPacket }} />}>
              <Route path="/:packetName/:packetId/file/*" element={<PacketFileFullScreen />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("renders PacketReport when the file is an HTML file", async () => {
    URL.createObjectURL = jest.fn(() => "testFileObjectUrl");
    const revokeObjectURL = jest.fn();
    URL.revokeObjectURL = revokeObjectURL;

    const { unmount } = renderComponent("report.html");
    await waitFor(() => {
      expect(screen.getByTestId("report-iframe").getAttribute("src")).toBe("testFileObjectUrl");
    });

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("testFileObjectUrl");
  });

  it("renders image when the file is an image file, and correctly revokes blob URL", async () => {
    URL.createObjectURL = jest.fn(() => "testFileObjectUrl");
    const revokeObjectURL = jest.fn();
    URL.revokeObjectURL = revokeObjectURL;

    const { unmount } = renderComponent(imageFile.path);

    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("src", "testFileObjectUrl");
    expect(image).toHaveAttribute("alt", imageFile.path);

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("testFileObjectUrl");
  });

  it("renders an error message when the file name is not recognised", async () => {
    renderComponent("no_such.file");

    expect(screen.getByText(/File not found/i)).toBeVisible();
  });

  it("renders a helpful message when the file type is not supported", async () => {
    renderComponent("orderly.R");

    expect(screen.getByText(/not supported/i)).toBeVisible();
  });
});

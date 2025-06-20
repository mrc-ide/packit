import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { mockPacket } from "../../../mocks";
import { PacketFileFullScreen } from "../../../../app/components/contents/packets";
import { SWRConfig } from "swr";
import { PacketMetadata } from "../../../../types";
import { PacketLayout } from "../../../../app/components/main";
import * as UserProvider from "../../../../app/components/providers/UserProvider";

jest.mock("../../../../lib/auth/getAuthHeader", () => ({
  getAuthHeader: () => ({ Authorization: "fakeAuthHeader" })
}));
const mockUseUser = jest.spyOn(UserProvider, "useUser");

const imageFile = mockPacket.files.filter((file) => file.path === "directory/graph.png")[0];

describe("PacketFileFullScreen", () => {
  const renderComponent = (filePath: string, packet: PacketMetadata = mockPacket) => {
    return render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${packet.name}/${packet.id}/file/${filePath}`]}>
          <Routes>
            <Route element={<PacketLayout />}>
              <Route path="/:packetName/:packetId/file/*" element={<PacketFileFullScreen />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      authorities: []
    } as any);
  });

  it("renders PacketReport when the file is an HTML file, and correctly revokes blob URL", async () => {
    URL.createObjectURL = jest.fn(() => "testFileObjectUrl");
    const revokeObjectURL = jest.fn();
    URL.revokeObjectURL = revokeObjectURL;

    renderComponent("report.html");

    const { unmount } = renderComponent("report.html");

    expect((await screen.findByTestId("report-iframe")).getAttribute("src")).toBe("testFileObjectUrl");

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("testFileObjectUrl");
  });

  it("renders image when the file is an image file, and correctly revokes blob URL", async () => {
    URL.createObjectURL = jest.fn(() => "testFileObjectUrl");
    const revokeObjectURL = jest.fn();
    URL.revokeObjectURL = revokeObjectURL;

    const { unmount } = renderComponent(imageFile.path);

    await waitFor(() => {
      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("src", "testFileObjectUrl");
      expect(image).toHaveAttribute("alt", imageFile.path);
    });

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("testFileObjectUrl");
  });

  it("renders an error message when an HTML file name is not recognised", async () => {
    renderComponent("nonesuch.html");

    expect(screen.getByText(/File not found/i)).toBeVisible();
  });

  it("renders an error message when an image file name is not recognised", async () => {
    renderComponent("nonesuch.png");

    expect(screen.getByText(/File not found/i)).toBeVisible();
  });

  it("renders a helpful message when the file type is not supported", async () => {
    renderComponent("orderly.R");

    expect(screen.getByText(/not supported/i)).toBeVisible();
  });

  it("should show an error if the packet name in the URL does not match the packet", async () => {
    renderComponent(imageFile.path, { ...mockPacket, name: "different-name" });

    await waitFor(() => {
      expect(screen.getByText(/Error fetching packet details/i)).toBeVisible();
    });
  });
});

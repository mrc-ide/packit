import { act, render, screen } from "@testing-library/react";
import { PreviewableFile } from "../../../../app/components/contents/downloads/PreviewableFile";
import { mockPacket } from "../../../mocks";
import { createMemoryRouter, MemoryRouter, Outlet, Route, RouterProvider, Routes } from "react-router-dom";
import { FileMetadata, PacketMetadata } from "../../../../types";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { PacketLayout } from "../../../../app/components/main";
import { PacketDetails } from "../../../../app/components/contents/packets";
import { FileRow } from "../../../../app/components/contents/downloads/FileRow";

const imageFile = mockPacket.files.filter((file) => file.path === "directory/graph.png")[0];

const renderComponent = (file: FileMetadata, fileName: string) => {
  const routes = [
    {
      path: "/",
      element: <Outlet context={{ packet: mockPacket }} />,
      children: [{ path: "/", element: <PreviewableFile file={file} fileName={fileName}></PreviewableFile> }]
    }
  ];
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });

  return render(<RouterProvider router={router} />);
};

describe("previewable file component", () => {
  it("renders a link to the file page in a new tab", async () => {
    renderComponent(imageFile, "filename");

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent(/^filename$/);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("href", `/${mockPacket.name}/${mockPacket.id}/file/${imageFile.path}`);
  });

  it("renders a preview of the file within the hover card when it is an image file", async () => {
    URL.createObjectURL = jest.fn(() => "fakeObjectUrl");
    URL.revokeObjectURL = jest.fn();

    renderComponent(imageFile, "plot.gif");

    const hoverCardTrigger = screen.getByText("plot.gif");
    userEvent.hover(hoverCardTrigger);

    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("src", "fakeObjectUrl");
    expect(image).toHaveAttribute("alt", "Preview of the image download plot.gif");
  });

  it("revokes the object URL when the component is unmounted", async () => {
    URL.createObjectURL = jest.fn(() => "fakeObjectUrl");
    const revokeObjectURL = jest.fn();
    URL.revokeObjectURL = revokeObjectURL;

    const { unmount } = renderComponent(imageFile, "plot.gif");

    const hoverCardTrigger = screen.getByText("plot.gif");
    userEvent.hover(hoverCardTrigger);

    await screen.findByRole("img");

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("fakeObjectUrl");
  });

  it("renders error component if error fetching file data", async () => {
    const mockCreateObjectUrl = jest.fn();
    URL.createObjectURL = mockCreateObjectUrl;
    mockCreateObjectUrl.mockImplementation(() => {
      throw new Error("test error");
    });
    renderComponent(imageFile, "plot.gif");

    expect(await screen.findByText(/Error loading file/i)).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

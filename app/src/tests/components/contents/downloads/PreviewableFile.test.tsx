import { render, screen } from "@testing-library/react";
import { PreviewableFile } from "../../../../app/components/contents/downloads/PreviewableFile";
import { mockPacket } from "../../../mocks";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { FileMetadata } from "../../../../types";
import userEvent from "@testing-library/user-event";

const imageFile = mockPacket.files.filter((file) => file.path === "directory/graph.png")[0];

const renderComponent = (file: FileMetadata, fileName: string) => {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <PreviewableFile file={file} fileName={fileName}></PreviewableFile>
      }
    ],
    { initialEntries: ["/"] }
  );
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

    renderComponent(imageFile, "plot.gif");

    const hoverCardTrigger = screen.getByRole("link");
    userEvent.hover(hoverCardTrigger);

    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("src", "fakeObjectUrl");
    expect(image).toHaveAttribute("alt", "Preview of the image download plot.gif");
  });
});

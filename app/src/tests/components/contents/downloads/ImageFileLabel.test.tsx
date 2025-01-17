import { act, render, screen, waitFor } from "@testing-library/react";
import { ImageFileLabel } from "../../../../app/components/contents/downloads/ImageFileLabel";
import { mockPacket } from "../../../mocks";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { FileMetadata } from "../../../../types";
import userEvent from "@testing-library/user-event";

const imageFile = mockPacket.files.filter((file) => file.path === "directory/graph.png")[0];

const renderComponent = (file: FileMetadata = imageFile, fileName: string = "filename") => {
  const router = createMemoryRouter(
    [{ path: "/", element: <ImageFileLabel packet={mockPacket} file={file} fileName={fileName}></ImageFileLabel> }],
    { initialEntries: ["/"] }
  );
  return render(<RouterProvider router={router} />);
};

describe("image file label component", () => {
  it("renders a link to the file page in a new tab", async () => {
    renderComponent();

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent(/^filename$/);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("href", `/${mockPacket.name}/${mockPacket.id}/file/${imageFile.hash}`);
  });

  it("renders a preview of the image within the hover card", async () => {
    URL.createObjectURL = jest.fn(() => "fakeObjectUrl");

    renderComponent(imageFile, "plot.gif");

    const hoverCardTrigger = screen.getByRole("link");
    userEvent.hover(hoverCardTrigger);

    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("src", "fakeObjectUrl");
    expect(image).toHaveAttribute("alt", "Preview of the image download plot.gif");
  });
});

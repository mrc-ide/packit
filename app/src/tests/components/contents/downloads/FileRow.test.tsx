import { render, screen } from "@testing-library/react";
import { mockPacket } from "../../../mocks";
import { FileRow } from "../../../../app/components/contents/downloads/FileRow";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";

const expectIconToBeRendered = (container: HTMLElement, iconName: string) => {
  const icon = container.querySelector(".lucide") as HTMLImageElement;
  expect(icon.classList).toContain(iconName);
};

const renderComponent = (path: string, sharedResource?: boolean) => {
  const routes = [
    {
      path: "/",
      element: <Outlet context={{ packet: mockPacket }} />,
      children: [{ path: "/", element: <FileRow path={path} sharedResource={sharedResource} /> }]
    }
  ];
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });

  return render(<RouterProvider router={router} />);
};

describe("file row component", () => {
  it("can render file path, file size, relevant icon (determined by file extension), and download button", async () => {
    const { container } = renderComponent("report.html");

    expect(await screen.findByText("report.html")).toBeVisible();
    expect(await screen.findByText("40 bytes")).toBeVisible();
    expectIconToBeRendered(container, "lucide-presentation");
    const downloadButton = await screen.findByRole("button");
    expect(downloadButton).toHaveTextContent("Download");
    expect(screen.queryByText("Shared resource")).not.toBeInTheDocument();
  });

  it("when the file path includes a directory it excludes this from the displayed file name", async () => {
    URL.createObjectURL = jest.fn(() => "fakeObjectUrl");

    const { container } = renderComponent("directory//graph.png");

    expect(await screen.findByText(/^graph.png$/)).toBeVisible();
    expect(await screen.findByText("7.17 KB")).toBeVisible();
    expectIconToBeRendered(container, "lucide-chart-column");
    expect(screen.queryByText("Shared resource")).not.toBeInTheDocument();
  });

  it("when the file extension indicates an image file, it renders a link to the image", async () => {
    renderComponent("directory//graph.png");

    expect(screen.getByRole("link")).toHaveTextContent(/^graph.png$/);
  });

  it("when the file is a shared resource, this information is displayed", async () => {
    const { container } = renderComponent("a_renamed_common_resource.csv", true);

    expect(await screen.findByText("a_renamed_common_resource.csv")).toBeVisible();
    expect(await screen.findByText("11 bytes")).toBeVisible();
    expectIconToBeRendered(container, "lucide-table-properties");
    expect(await screen.findByText("Shared resource")).toBeVisible();
  });

  it("when the file extension is not recognised, the icon defaults to a file icon", async () => {
    const { container } = renderComponent("other_extensions.txt");

    expect(await screen.findByText("other_extensions.txt")).toBeVisible();
    expect(await screen.findByText("15 bytes")).toBeVisible();
    expectIconToBeRendered(container, "lucide-file");
    expect(screen.queryByText("Shared resource")).not.toBeInTheDocument();
  });

  it("can render relevant icon for script files, case-insensitively", async () => {
    const { container } = renderComponent("orderly.R");

    expect(await screen.findByText("orderly.R")).toBeVisible();
    expect(await screen.findByText("137 bytes")).toBeVisible();
    expectIconToBeRendered(container, "lucide-file-code2");
    expect(screen.queryByText("Shared resource")).not.toBeInTheDocument();
  });
});

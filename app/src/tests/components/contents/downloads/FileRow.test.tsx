import { render, screen } from "@testing-library/react";
import { mockPacket } from "../../../mocks";
import FileRow from "../../../../app/components/contents/downloads/FileRow";

const expectIconToBeRendered = (container: HTMLElement, iconName: string) => {
  const icon = container.querySelector(".lucide") as HTMLImageElement;
  expect(icon.classList).toContain(iconName);
};

describe("file row component", () => {
  it("can render file path, file size, relevant icon (determined by file extension). and download button", async () => {
    const { container } = render(<FileRow path={"report.html"} packet={mockPacket} />);

    expect(await screen.findByText("report.html")).toBeVisible();
    expect(await screen.findByText("40 bytes")).toBeVisible();
    expectIconToBeRendered(container, "lucide-presentation");
    const downloadButton = await screen.findByRole("button");
    expect(downloadButton).toHaveTextContent("Download");
    expect(screen.queryByText("Shared resource")).not.toBeInTheDocument();
  });

  it("when the file path includes a directory it excludes this from the displayed file name", async () => {
    const { container } = render(<FileRow path={"directory//graph.png"} packet={mockPacket} />);

    expect(await screen.findByText(/^graph.png$/)).toBeVisible();
    expect(await screen.findByText("7.17 KB")).toBeVisible();
    expectIconToBeRendered(container, "lucide-chart-column");
    expect(screen.queryByText("Shared resource")).not.toBeInTheDocument();
  });

  it("when the file is a shared resource, this information is displayed", async () => {
    const { container } = render(<FileRow path={"a_renamed_common_resource.csv"} packet={mockPacket}
                                          sharedResource={true} />);

    expect(await screen.findByText("a_renamed_common_resource.csv")).toBeVisible();
    expect(await screen.findByText("11 bytes")).toBeVisible();
    expectIconToBeRendered(container, "lucide-table-properties");
    expect(await screen.findByText("Shared resource")).toBeVisible();
  });

  it("when the file extension is not recognised, the icon defaults to a file icon", async () => {
    const { container } = render(<FileRow path={"other_extensions.txt"} packet={mockPacket} />);

    expect(await screen.findByText("other_extensions.txt")).toBeVisible();
    expect(await screen.findByText("15 bytes")).toBeVisible();
    expectIconToBeRendered(container, "lucide-file");
    expect(screen.queryByText("Shared resource")).not.toBeInTheDocument();
  });
});

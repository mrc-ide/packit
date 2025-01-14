import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockPacket } from "../../../mocks";
import { Custom } from "../../../../types";
import { OrderlyDownloads } from "../../../../app/components/contents/downloads/OrderlyDownloads";

describe("orderly downloads component", () => {
  const renderComponent = (customMetadata: Custom) => {
    const packet = { ...mockPacket, custom: customMetadata };

    render(<OrderlyDownloads packet={packet} />);
  };

  it("renders the 'artefacts' and 'other files' accordion sections with only the first open", async () => {
    renderComponent(mockPacket.custom as Custom);

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(await screen.findByText("Other files")).toBeInTheDocument();
    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
    expect(screen.queryByText("a_renamed_common_resource.csv")).toBeNull();

    userEvent.click(screen.getByText("Other files"));
    expect(await screen.findByText("a_renamed_common_resource.csv")).toBeVisible();
    expect(screen.queryByText("orderly.R")).toBeNull(); // Excludes inputs with role 'orderly'.
  });

  it("renders no accordion when there are no 'other files'", async () => {
    const customMetadata = { orderly: { ...mockPacket?.custom?.orderly, role: [] } } as Custom;
    renderComponent(customMetadata);

    expect(await screen.findByText("Artefacts")).toBeInTheDocument();
    expect(screen.queryByText("Other files")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renders no accordion when there are no artefacts", async () => {
    const customMetadata = { orderly: { ...mockPacket?.custom?.orderly, artefacts: [] } } as Custom;
    renderComponent(customMetadata);

    expect(await screen.findByText("Files")).toBeInTheDocument();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });

  it("renders a message when there are no files", async () => {
    const customMetadata = { orderly: { ...mockPacket?.custom?.orderly, role: [], artefacts: [] } } as Custom;
    renderComponent(customMetadata);

    expect(await screen.findByText(/There are no artefacts/)).toBeInTheDocument();
    expect(screen.queryByText("Artefacts")).not.toBeInTheDocument();
    expect(screen.queryByText("Files")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });
});

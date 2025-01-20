import { render, waitFor, screen } from "@testing-library/react";
import { PacketReports } from "../../../../app/components/contents/packets/PacketReports";
import { mockPacket } from "../../../mocks";
import { PacketMetadata } from "../../../../types";
import { Accordion } from "../../../../app/components/Base/Accordion";

jest.mock("../../../../lib/download", () => ({
  getFileObjectUrl: async () => "fakeObjectUrl"
}));

describe("Packet reports component", () => {
  const renderComponent = (packet: PacketMetadata) => {
    render(
      <Accordion type="single" defaultValue="reports">
        <PacketReports packet={packet} />
      </Accordion>
    );
  };

  it("renders PacketReport component and link", async () => {
    renderComponent(mockPacket);
    await waitFor(() => {
      const iframe = screen.getByTestId("report-iframe");
      expect(iframe).toBeVisible();
      expect(iframe.getAttribute("src")).toBe("fakeObjectUrl");
      expect(screen.getByRole("link").getAttribute("href")).toBe(`${mockPacket.id}/file/report.html`);
    });
  });

  it("renders None if no report in packet", async () => {
    const reportlessPacket = {
      ...mockPacket,
      files: [mockPacket.files[0]]
    };
    renderComponent(reportlessPacket);
    await waitFor(() => {
      expect(screen.getByText("None")).toBeVisible();
      expect(screen.queryByTestId("report-iframe")).not.toBeInTheDocument();
    });
  });
});

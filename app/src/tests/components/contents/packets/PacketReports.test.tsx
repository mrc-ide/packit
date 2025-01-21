import { render, waitFor, screen } from "@testing-library/react";
import { PacketReports } from "../../../../app/components/contents/packets/PacketReports";
import { mockPacket } from "../../../mocks";
import { PacketMetadata } from "../../../../types";
import { SWRConfig } from "swr";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { PacketReport } from "../../../../app/components/contents/packets/PacketReport";

jest.mock("../../../../lib/download", () => ({
  ...jest.requireActual("../../../../lib/download"),
  getFileObjectUrl: async () => "fakeObjectUrl"
}));
URL.createObjectURL = jest.fn();
URL.revokeObjectURL = jest.fn();

describe("Packet reports component", () => {
  const renderComponent = (packet: PacketMetadata) => {
    return render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<Outlet context={{ packet }} />}>
              <Route path="/" element={<PacketReports packet={packet} />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("renders PacketReport component and link", async () => {
    renderComponent(mockPacket);
    const iframe = await screen.findByTestId("report-iframe");
    expect(iframe).toBeVisible();
    expect(iframe.getAttribute("src")).toBe("fakeObjectUrl");
    expect(screen.getByRole("link").getAttribute("href")).toBe(`${mockPacket.id}/file/report.html`);
  });

  it("renders None if no report in packet", async () => {
    const reportlessPacket = {
      ...mockPacket,
      files: [mockPacket.files[0]]
    };
    renderComponent(reportlessPacket);
    expect(await screen.findByText("None")).toBeVisible();
    expect(screen.queryByTestId("report-iframe")).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { PacketReports } from "@components/contents/packets/PacketReports";
import { mockPacket } from "@/tests/mocks";
import { PacketMetadata } from "@/types";
import { SWRConfig } from "swr";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { Accordion } from "@components/Base/Accordion";

vitest.mock("@lib/download", async () => ({
  ...(await vitest.importActual("@lib/download")),
  getFileObjectUrl: async () => "fakeObjectUrl"
}));
URL.createObjectURL = vitest.fn();
URL.revokeObjectURL = vitest.fn();

describe("Packet reports component", () => {
  const renderComponent = (packet: PacketMetadata) => {
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<Outlet context={{ packet }} />}>
              <Route
                path="/"
                element={
                  <Accordion type="single" defaultValue="reports">
                    <PacketReports packet={packet} />
                  </Accordion>
                }
              />
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
    expect(screen.getByRole("link").getAttribute("href")).toBe(`/${mockPacket.name}/${mockPacket.id}/file/report.html`);
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

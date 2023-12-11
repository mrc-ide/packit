import { render, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import PacketDetails from "../../../../app/components/contents/packets/PacketDetails";
import { PacketLayout } from "../../../../app/components/main";
import { server } from "../../../../msw/server";
import { mockPacket } from "../../../mocks";

describe("packet details component", () => {
  const renderComponent = () => {
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        <MemoryRouter initialEntries={[`/${mockPacket.name}/${mockPacket.id}`]}>
          <Routes>
            <Route element={<PacketLayout />} path="/:packetName/:packetId">
              <Route path="/:packetName/:packetId" element={<PacketDetails />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("renders parameters", async () => {
    renderComponent();

    await waitFor(() => {
      Object.keys(mockPacket.parameters as object).forEach((key) => {
        expect(screen.getByText(key)).toBeVisible();
      });
    });
  });

  it("renders html file with link", async () => {
    renderComponent();

    await screen.findByRole("link", { name: /fullscreen/i });
  });

  it("should not render parameters or files when none", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.json({ ...mockPacket, parameters: {}, files: [] }));
      })
    );
    renderComponent();

    await screen.findByText(mockPacket.id);

    expect(screen.queryByText((mockPacket as any).parameters["a"])).not.toBeInTheDocument();
    expect(screen.queryByText(/fullscreen/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/none/i)).toHaveLength(2);
  });
});
